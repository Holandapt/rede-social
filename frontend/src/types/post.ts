// Tipos relacionados com as postagens e com as respostas paginadas da API.

// Dados públicos mínimos do autor (igual ao AuthorSerializer do back-end).
export interface PostAuthor {
  id: number;
  username: string;
  name: string;
  avatar: string | null;
}

// Uma postagem, tal como a API a devolve.
export interface Post {
  id: number;
  author: PostAuthor;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  liked_by_me: boolean;
  comments_count: number;
}

// Resposta paginada global do DRF (PageNumberPagination).
// É uma interface genérica em TypeScript. O <T> funciona
// como um "espaço reservado" (tipo parâmetro) que podes substituir por qualquer modelo ou
// interface (por exemplo, Paginated<Post> ou Paginated<User>), tornando o teu código reutilizável
// para qualquer tipo de dado.
export interface Paginated<T>{
  count: number;
  next: string | null; // URL da página seguinte, ou null se for a última
  previous: string | null;
  results: T[];
}
