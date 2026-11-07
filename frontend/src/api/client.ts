import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios";

// Em produção vem de VITE_API_URL (definida na Vercel); em local usa o servidor de desenvolvimento.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Cliente separado, sem interceptors, usado só para renovar o token.
// Assim, uma falha no refresh nunca volta a disparar o interceptor (sem ciclos).
const refreshClient = axios.create({
  baseURL: BASE_URL,
});

// Endpoints públicos: não precisam de token, e enviar um token expirado
// nestes pedidos faz o DRF rejeitar com 401 antes de verificar as credenciais.
const PUBLIC_ENDPOINTS = ["/auth/login/", "/auth/register/", "/auth/refresh/"];

function isPublicEndpoint(url?: string): boolean {
  return PUBLIC_ENDPOINTS.some((path) => url?.startsWith(path));
}

// Um interceptor é uma função que é executada antes de cada requisição feita com o axios.
// Ele permite que você modifique a requisição antes de ela ser enviada.
api.interceptors.request.use((config) => {
  // o localStorage é um objeto que permite armazenar dados no navegador do usuário.
  const token = localStorage.getItem("access");

  if (token && !isPublicEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RefreshResponse {
  access: string;
  refresh?: string; // só vem se o back-end rodar os refresh tokens
}

// Guarda a renovação em curso. Se já houver uma, os outros pedidos reaproveitam
// em vez de iniciarem outra: é o "refresh único e partilhado".
let refreshPromise: Promise<string> | null = null;

// A variável refreshPromise funciona como um semáforo/cadeado lógico.
// Se já houver um pedido de refresh a correr (refreshPromise não é null),
// os pedidos seguintes que cheguem simplesmente reaproveitam a mesma promessa em vez de
// dispararem novos pedidos. Quando termina (.finally),
// limpa a variável para permitir futuros refreshes.
function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return Promise.reject(new Error("Sem refresh token."));

    refreshPromise = refreshClient
      .post<RefreshResponse>("/auth/refresh/", { refresh })
      .then(({ data }) => {
        localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        return data.access;
      })
      .finally(() => {
        refreshPromise = null; // liberta para uma próxima renovação
      });
  }
  return refreshPromise;
}

// Se o refresh token também tiver expirado ou for inválido,
//  significa que a sessão do utilizador terminou por completo.
// Esta função limpa os tokens do localStorage e força o navegador a redirecionar o utilizador
//  para a página de login (usando window.location.assign porque estamos fora de um componente
//  React, logo o gancho useNavigate do router não estaria disponível).
function endSession() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

// O "_retry" marca os pedidos que já foram repetidos uma vez.
// Esta propriedade funciona como um carimbo para sabermos se um determinado pedido já tentou ser repetido após um erro 401.
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean};

// O response.use aceita duas funções: a primeira trata respostas bem-sucedidas
// (que aqui apenas devolvemos intactas: (response) => response), e a segunda trata erros.
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.response || !error.config) {
      return Promise.reject(error);
    }

    const original = error.config as RetriableConfig

    // Só tratamos 401 em endpoints protegidos e que ainda não foram repetidos.
    if (
      error.response.status !== 401 ||
      isPublicEndpoint(original.url) ||
      original._retry
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newAccess = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original); // repete o pedido original com o token novo
    } catch (refreshError) {
      // O refresh também falhou (expirado ou inválido): a sessão acabou.
      endSession();
      return Promise.reject(refreshError);
    }
  },
);
