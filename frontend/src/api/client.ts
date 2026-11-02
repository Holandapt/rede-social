import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Endpoints públicos: não precisam de token, e enviar um token expirado
// nestes pedidos faz o DRF rejeitar com 401 antes de verificar as credenciais.
const PUBLIC_ENDPOINTS = ["/auth/login/", "/auth/register/", "/auth/refresh/"];

// Um interceptor é uma função que é executada antes de cada requisição feita com o axios.
// Ele permite que você modifique a requisição antes de ela ser enviada.
api.interceptors.request.use((config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((path) =>
    config.url?.startsWith(path),
  );
  // o localStorage é um objeto que permite armazenar dados no navegador do usuário.
  const token = localStorage.getItem("access");

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
