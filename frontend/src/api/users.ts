import { api } from "./client";
import type { Paginated } from "../types/post";
import type { PublicUser } from "../types/publicUser";

// Página de utilizadores (o próprio fica de fora). Número de página, como no feed.
export async function getUsers(page: number): Promise<Paginated<PublicUser>> {
  const { data } = await api.get<Paginated<PublicUser>>("/users/", { params: { page } });
  return data;
}

// Segue um utilizador (idempotente no back-end).
export async function followUser(id: number): Promise<void> {
  await api.post(`/users/${id}/follow/`);
}

// Deixa de seguir um utilizador (204 mesmo que não o seguisse).
export async function unfollowUser(id: number): Promise<void> {
  await api.delete(`/users/${id}/follow/`);
}

// Página de seguidores de um utilizador. Número de página, como no feed.
export async function getFollowers(id: number, page: number): Promise<Paginated<PublicUser>> {
  const { data } = await api.get<Paginated<PublicUser>>(`/users/${id}/followers/`, { params: { page } });
  return data;
}

// Página de quem o utilizador segue.
export async function getFollowing(id: number, page: number): Promise<Paginated<PublicUser>> {
  const { data } = await api.get<Paginated<PublicUser>>(`/users/${id}/following/`, { params: { page } });
  return data;
}
