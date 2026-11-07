import { api } from "./client";
import type { Paginated, Post } from "../types/post";

// Cria uma postagem nova e devolve-a já com o autor preenchido.
export async function createPost(content: string): Promise<Post> {
  const { data } = await api.post<Post>("/posts/", { content });
  return data;
}

// Vai buscar uma página do feed (posts do próprio utilizador e de quem ele segue).
// Usamos o número da página em vez do URL "next" para não depender do http/https do servidor.
// A promessa de retorno Garante que, quando a função terminar com sucesso, ela vai entregar um
// objeto estruturado do tipo Paginated<Post>
export async function getFeed(page: number): Promise<Paginated<Post>> {
  // O <Paginated<Post>> diz ao Axios para tipar a resposta que vai chegar.
  // { params: { page } } É a forma como o Axios envia parâmetros de consulta (query parameters) na URL
  const { data } = await api.get<Paginated<Post>>("/feed/", { params: { page } });
  return data;
}
