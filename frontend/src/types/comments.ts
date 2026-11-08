import type {PostAuthor} from "./post"

// Um comentário, tal como a API o devolve (igual ao CommentSerializer do back-end).
export interface Comment{
  id: number;
  author: PostAuthor;
  content: string;
  created_at: string;
}
