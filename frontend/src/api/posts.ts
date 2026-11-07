import { api } from "./client";
import type { Post } from "../types/post";

// Cria uma postagem nova e devolve-a já com o autor preenchido.
export async function createPost(content: string): Promise<Post> {
  const { data } = await api.post<Post>("/posts/", { content });
  return data;
}
