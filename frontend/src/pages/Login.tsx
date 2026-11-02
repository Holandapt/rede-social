import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import type { TokenPair } from "../types/user";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();



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
      navigate("/");
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
    <main>
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Utilizador:
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required/>
        </label>
        <label>
          Palavra-passe:
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required/>
        </label>
        { error && <p role="alert">{error}</p>}
        < button type="submit" disabled={loading}>
          {loading ? "A entrar..." : "Entrar"}
        </button>
      </form>
      <p>
        Ainda não tem uma conta? <Link to="/register">Registe-se</Link>
      </p>
    </main>
  )
}

