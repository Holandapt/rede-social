import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { getErrorMessages } from "../api/erros";
import type { RegisterPayload } from "../types/user";

export default function Register() {
  const [form, setForm] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field: keyof RegisterPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await api.post("/auth/register/", form);
      navigate("/login");
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Utilizador
          <input
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        {errors.length > 0 && (
          <ul role="alert">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "A criar..." : "Registar"}
        </button>
      </form>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </main>
  );
}
