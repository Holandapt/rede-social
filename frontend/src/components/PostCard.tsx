import { useState, type FormEvent } from "react";
import type { Post } from "../types/post";
import { deletePost, updatePost } from "../api/posts";
import { getErrorMessages } from "../api/erros";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

interface Props {
  post: Post;
  currentUserId: number; // quem está autenticado, para saber se o post é dele
  onUpdated: (post: Post) => void; // chamado só quando a edição deu certo
  onDeleted: (postId: number) => void; // chamado só quando o apagar deu certo
}

// Mostra uma publicação: autor (avatar, nome e @utilizador), data e texto.
// Se o post for do utilizador autenticado, permite editar e apagar.
export default function PostCard({ post, currentUserId, onUpdated, onDeleted }: Props) {
  const { author } = post;
  // O nome pode estar vazio; nesse caso mostramos o utilizador.
  const nome = author.name || author.username;
  const isOwn = author.id === currentUserId;

  const [editing, setEditing] = useState(false);
  const [texto, setTexto] = useState(post.content);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Abre o modo de edição com o texto atual do post.
  function handleStartEdit() {
    setTexto(post.content);
    setErrors([]);
    setEditing(true);
  }

  function handleCancel() {
    setErrors([]);
    setEditing(false);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setBusy(true);
    try {
      const atualizado = await updatePost(post.id, texto);
      onUpdated(atualizado);
      setEditing(false);
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Apagar esta publicação?")) return;
    setErrors([]);
    setBusy(true);
    try {
      await deletePost(post.id);
      onDeleted(post.id);
    } catch (err) {
      setErrors(getErrorMessages(err));
      setBusy(false);
    }
  }

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
        {isOwn && !editing && (
          <>
            {" "}
            <button onClick={handleStartEdit} disabled={busy}>
              Editar
            </button>{" "}
            <button onClick={handleDelete} disabled={busy}>
              Apagar
            </button>
          </>
        )}
      </header>
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {editing ? (
        <form onSubmit={handleSave}>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={500}
            rows={3}
            required
          />
          <button type="submit" disabled={busy || texto.trim() === ""}>
            {busy ? "A guardar..." : "Guardar"}
          </button>{" "}
          <button type="button" onClick={handleCancel} disabled={busy}>
            Cancelar
          </button>
        </form>
      ) : (
        /* pre-wrap mantém as quebras de linha que o autor escreveu */
        <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
      )}
      <footer>
        <LikeButton
          postId={post.id}
          initialLiked={post.liked_by_me}
          initialCount={post.likes_count}
        />
        <CommentSection postId={post.id} initialCount={post.comments_count} />
      </footer>
    </article>
  );
}
