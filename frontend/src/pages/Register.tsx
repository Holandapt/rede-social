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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-900 tracking-tight">Criar conta</h1>
        <form  className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Utilizador
                <input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full mb-2 rounded-lg border border-gray-300 px-4 py-1 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full mb-2 rounded-lg border border-gray-300 px-4 py-1 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Senha
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full mb-2 rounded-lg border border-gray-300 px-4 py-1 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </label>
            </div>
          </div>
          {errors.length > 0 && (
            <ul role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 space-y-1">
              {errors.map((msg) => (
                <li key={msg} className="flex items-center gap-1.5">{msg}</li>
              ))}
            </ul>
          )}
          <button className="mx-auto block rounded-md bg-transparent-600 cursor-pointer border border-solid border-gray-200  px-8 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-gray-200 active:bg-gray-600" type="submit" disabled={loading}>
            {loading ? "A criar..." : "Registar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta? <Link className="font-semibold text-gray-800 hover:underline" to="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
