import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
})

// Um interceptor é uma função que é executada antes de cada requisição feita com o axios.
// Ele permite que você modifique a requisição antes de ela ser enviada.
api.interceptors.request.use((config) => {
  // o localStorage é um objeto que permite armazenar dados no navegador do usuário.
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})
