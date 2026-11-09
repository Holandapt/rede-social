import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import type { TokenPair } from "../types/user";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

   // Página que o utilizador queria abrir antes de ser mandado para o login.
  const from =
    // location.state: É o estado passado via navegação pelo React Router
    // Como o TypeScript não sabe exatamente o formato desse state por padrão, dizemos a ele:
    // "Trate este objeto como algo que possui opcionalmente uma propriedade from
    // Indica que o state pode vir vazio (null) caso o usuário tenha acessado a página de
    // login diretamente pela URL (digitando no navegador), e não porque foi redirecionado.
    // O operador ?? (Nullish Coalescing) significa: "Se a expressão da esquerda resultar em nulo ou indefinido, use o valor da direita".
    // Ou seja, se o usuário foi redirecionado porque tentou acessar uma rota protegida,
    // ele voltará para lá. Mas se ele acessou a tela de login diretamente (portanto não há state.from),
    //  ele será enviado para a página padrão ("/", geralmente a Home ou o Dashboard principal).
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";



  // Essa função é responsável por lidar com o envio do formulário de login.
  // Ela previne o comportamento padrão do formulário, limpa qualquer mensagem de erro existente
  // e define o estado de carregamento como verdadeiro.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Tenta enviar uma solicitação POST para o endpoint de login da API com o nome de usuário e senha fornecidos.
    try {
      const { data } = await api.post<TokenPair>("/auth/login/", {
        username,
        password,
      });
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      // O parâmetro replace: true substitui a URL atual no histórico do navegador em vez de adicionar uma nova camada (que seria o comportamento padrão).
      navigate(from, { replace: true });;
    } // Se ocorrer um erro durante a solicitação, ele verifica se é um erro Axios e se o status da resposta é 401 (não autorizado).
    catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError("Utilizador ou palavra-passe incorretos.");
      } else {
        setError(
          "Ocorreu um erro ao tentar iniciar sessão. Por favor, tente novamente mais tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1>Entrar</h1>
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Utilizador:
            <input className="w-full mb-2 rounded-lg border border-gray-300 px-2 py-1 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required/>
          </label>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Palavra-passe:
            <input className="w-full mb-2 rounded-lg border border-gray-300 px-4 py-1 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required/>
          </label>
          { error && <p role="alert">{error}</p>}
          < button className="mx-auto block rounded-md bg-transparent-600 cursor-pointer border border-solid border-gray-200  px-8 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-gray-200 active:bg-gray-600" type="submit" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem uma conta? <Link className="font-semibold text-gray-800 hover:underline" to="/register">Registe-se</Link>
        </p>
      </div>
    </main>
  )
}

