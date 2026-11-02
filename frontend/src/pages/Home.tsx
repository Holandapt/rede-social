import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { User } from "../types/user";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Esse trecho de código é executado quando o componente é montado.
  // Ele faz uma requisição GET para a rota de perfil da API para obter os dados do usuário logado.
  // Se a requisição for bem-sucedida, ele atualiza o estado do usuário com os dados retornados.
  // Caso contrário, ele navega para a página de login.
  useEffect(() => {
    api.get<User>("/auth/me/")
      .then(({ data }) => setUser(data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Essa função é chamada quando o botão de logout é clicado.
  // Ela remove os tokens de acesso e refresh do localStorage e navega para a página de login.
  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  if (!user) return <p> A carregar...</p>;

  return (
    <main>
      <h1>Olá, {user.username}!</h1>
      <p>O feed de notícias aparecerá aqui.</p>
      <button onClick={handleLogout}>Sair</button>
    </main>
  );
}
