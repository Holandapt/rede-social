import type { Post } from "../types/post";
import LikeButton from "./LikeButton";

interface Props {
  post: Post;
}

// Mostra uma publicação: autor (avatar, nome e @utilizador), data e texto.
export default function PostCard({ post }: Props) {
  const { author } = post;
  // O nome pode estar vazio; nesse caso mostramos o utilizador.
  const nome = author.name || author.username;

  return (
    <article>
      <header>
        {author.avatar && (
          <img
            src={author.avatar}
            alt={`Avatar de ${nome}`}
            width={40}
            height={40}
            style={{ objectFit: "cover", borderRadius: "50%" }}
          />
        )}
        <strong>{nome}</strong>{" "}
        <small>
          @{author.username} · {new Date(post.created_at).toLocaleString("pt-PT")}
        </small>
      </header>
      {/* pre-wrap mantém as quebras de linha que o autor escreveu */}
      <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
      <footer>
        <LikeButton
          postId={post.id}
          initialLiked={post.liked_by_me}
          initialCount={post.likes_count}
        />
      </footer>
    </article>
  );
}
