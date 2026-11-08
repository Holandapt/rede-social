import { api } from "./client";
import type { Comment } from "../types/comments";
import type { Paginated } from "../types/post";

// Vai buscar uma página de comentários de um post (mais antigos primeiro).
export async function getComments (
  postId: number,
  page: number,
):
// a função vai retornar uma Promessa que, quando resolvida com sucesso,
// entregará um objeto estruturado como Paginated (contendo a lista de comentários
// e metadados de paginação, como count, next, previous) composto por itens do tipo Comment.
Promise<Paginated<Comment>>{
  const {data} = await api.get<Paginated<Comment>>(
    `/posts/${postId}/comments/`,
    // O Axios converte automaticamente este objeto numa query string na URL.
    { params: {page}},
  );
  return data;
}

// Cria um comentário num post e devolve-o já com o autor preenchido.
export async function createComment(
  postId: number,
  content: string,
): Promise<Comment>{
  const { data } = await api.post<Comment>(`/posts/${postId}/comments/`, {
    content,
  });
  return data;
}
