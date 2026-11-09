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

// Estado de curtida de um post, tal como o back-end o devolve.
export interface LikeState {
  liked_by_me: boolean;
  likes_count: number;
}


// Curte um post (idempotente: curtir duas vezes não duplica).
export async function likePost(postId: number): Promise<LikeState> {
  const { data } = await api.post<LikeState>(`/posts/${postId}/like/`);
  return data;
}

// Tira a curtida de um post.
export async function unlikePost(postId: number): Promise<LikeState> {
  const { data } = await api.delete<LikeState>(`/posts/${postId}/like/`);
  return data;
}

// Edita o texto de um post próprio (PATCH parcial) e devolve-o atualizado.
export async function updatePost(postId: number, content: string): Promise<Post> {
  const { data } = await api.patch<Post>(`/posts/${postId}/`, { content });
  return data;
}

// Apaga um post próprio (o back-end responde 204, sem corpo).
export async function deletePost(postId: number): Promise<void> {
  await api.delete(`/posts/${postId}/`);
}
