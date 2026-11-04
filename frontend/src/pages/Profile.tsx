import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import type { ChangePasswordPayload, User } from "../types/user";
import { api } from "../api/client";
import { getErrorMessages } from "../api/erros";
import { Link } from "react-router-dom";

// Limite de tamanho do avatar, igual ao do back-end (2 MB).
const MAX_AVATAR_SIZE = 2 * 1024 * 1024

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  // Formulario do Perfil (nome e avatar)
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // formulario troca de senha
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Carrega os dados do perfil quando a pagina abre.

  useEffect(()=>{
    api
    .get<User>("/auth/me/")
    .then(({data}) => {
      setUser(data);
      setName(data.name);
    })
    .catch ((err) => setLoadErrors(getErrorMessages(err)))
  }, []);

  // Liberta a memória da pré-visualização: corre quando o previewUrl muda e quando a página fecha.

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Escolha do ficheiro: valida o tamanho no navegador e cria a pré-visualização.

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    setProfileErrors([]);
    setProfileSuccess("");
    // Acede ao evento (e) do input e obtém o primeiro ficheiro selecionado pelo utilizador
    // (files?.[0]). O operador ?? null garante que, se nenhum ficheiro for selecionado
    // (por exemplo, se o utilizador cancelar a janela de seleção), a variável file recebe null.
    const file = e.target.files?.[0] ?? null;

    if (file && file.size > MAX_AVATAR_SIZE) {
      setProfileErrors(["A imagem não pode ter mais de 2 MB."])
      e.target.value = "";
      setAvatarFile(null);
      setPreviewUrl(null);
      return;
    }

    setAvatarFile(file);
    // URL.createObjectURL cria um endereço temporário para mostrar o ficheiro escolhido.
    // Utiliza o método nativo URL.createObjectURL() para gerar uma URL temporária local
    // que aponta para o ficheiro na memória do browser.
    // Isto permite mostrar imediatamente uma imagem de pré-visualização ao utilizador
    // antes mesmo de a imagem ser enviada para o servidor.
    // Se nenhum ficheiro for selecionado, define a URL como null.
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  // Gerir o envio (submissão) do formulário de atualização do perfil do utilizador.
  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileErrors([]);
    setProfileSuccess("");
    setSavingProfile(true);

    // O objeto FormData é o padrão nativo do browser para construir conjuntos de pares chave/valor
    // que simulam um formulário HTML.
    // Não se define o Content-Type: o navegador acrescenta sozinho o "boundary" do multipart.
    const formData = new FormData();
    formData.append("name", name);
    if (avatarFile) formData.append("avatar", avatarFile);
    // Faz um pedido HTTP do tipo PATCH (usado para atualizações parciais) para a rota /auth/me/,
    // enviando o formData. Utiliza await porque a operação é assíncrona.
    try {
      const { data } = await api.patch<User>("/auth/me/", formData);
      setUser(data);
      setName(data.name);
      setAvatarFile(null);
      setPreviewUrl(null);
            // limpa o valor visual do input de ficheiro no DOM através do fileInputRef.current.value = "".
            if (fileInputRef.current) fileInputRef.current.value = "";
      setProfileSuccess("Perfil atualizado.");
    } catch (err) {
      setProfileErrors(getErrorMessages(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    setPasswordErrors([]);
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordErrors(["As palavras-passe novas não coincidem."]);
      return;
    }

    setSavingPassword(true);
    // Cria um objeto chamado payload contendo exatamente os dados que a
    // API espera receber para alterar a palavra-passe: a palavra-passe atual (old_password) e
    //  a nova palavra-passe (new_password).
    const payload: ChangePasswordPayload = {
      old_password: oldPassword,
      new_password: newPassword
    };

    try {
      await api.post("/auth/change-password/", payload);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Palavra-passe alterada com sucesso.");
    } catch (err) {
      setPasswordErrors(getErrorMessages(err));
    } finally {
      // O bloco finally executa sempre, quer o pedido tenha tido sucesso ou tenha falhado.
      // Aqui, devolve o botão ao seu estado normal, definindo savingPassword como false.
      setSavingPassword(false);
    }
  }

  if (loadErrors.length > 0) {
    return (
      <main>
        <ul role="alert">
          {loadErrors.map((message)=>(
            <li key={message}>{message}</li>
          ))}
        </ul>
        <Link to="/">Voltar</Link>
      </main>
    );
  }

  if (!user) return <p> A carregar...</p>

  const shownAvatar = previewUrl ?? user.avatar;

  return (
    <main>
      <p>
        <Link to="/">← Voltar</Link>
      </p>
      <h1>O meu perfil</h1>
      <section>
        <h2>Dados do perfil</h2>
        <p>
          Utilizador: <strong>{user.name}</strong>
          · E-mail: <strong>{user.email}</strong>
        </p>
        <form onSubmit={handleProfileSubmit}>
          {shownAvatar ? (
            <img src={shownAvatar} alt="Avatar" width={120} height={120} style={{ objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <p>Sem foto de perfil.</p>
          )}
          <label>
            Foto:
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange}/>
          </label>
          <label>
            Nome:
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} />
          </label>
          {profileErrors.length > 0 && (
            <ul role="alert">
              {profileErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          {profileSuccess && <p role="status">{profileSuccess}</p>}
          <button type="submit" disabled={savingProfile}>
            {savingProfile ? "A guardar..." : "Guardar"}
          </button>
        </form>
      </section>
      <section>
        <h2>Alterar palavra-passe</h2>
        <form onSubmit={handlePasswordSubmit}>
          <label>
            Palavra-passe atual:
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          <label>
            Nova palavra-passe:
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
          </label>
          <label>
            Confirmar nova palavra-passe:
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
          </label>
          {passwordErrors.length > 0 && (
            <ul role="alert">
              {passwordErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          {passwordSuccess && <p role="status">{passwordSuccess}</p>}
          <button type="submit" disabled={savingPassword}>
            {savingPassword ? "A alterar..." : "Alterar palavra-passe"}
          </button>
        </form>
      </section>
    </main>
  )
}
