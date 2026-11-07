// Dados públicos de um utilizador (igual ao PublicUserSerializer do back-end, sem email).
export interface PublicUser {
  id: number;
  username: string;
  name: string;
  avatar: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean; // se quem está autenticado já segue este utilizador
}
