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
    <article className="p-4 bg-white border-b border-gray-100 transition-colors hover:bg-gray-50/50">
      <header className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {author.avatar && (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={author.avatar}
              alt={`Avatar de ${nome}`}
              width={40}
              height={40}
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          )}
          <div className="flex flex-col">
            <strong>{nome}</strong>{" "}
            <small>
              @{author.username} · {new Date(post.created_at).toLocaleString("pt-PT")}
            </small>
          </div>
        </div>
        {isOwn && !editing && (
          <>
          <div className="flex space-x-2">
            {" "}
            <button className="rounded-full bg-transparent px-2 py-1 text-xs font-bold text-gray transition-colors hover:bg-gray-600 hover:text-white disabled:opacity-50 cursor-pointer" onClick={handleStartEdit} disabled={busy}>
              Editar
            </button>{" "}
            <button className="rounded-full bg-transparent px-2 py-1 text-xs font-bold text-gray transition-colors hover:bg-gray-600 hover:text-white disabled:opacity-50 cursor-pointer" onClick={handleDelete} disabled={busy}>
              Apagar
            </button>
          </div>
          </>
        )}
      </header>
      {errors.length > 0 && (
        <ul role="alert" className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-600 space-y-1">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <div className="mb-3">
        {editing ? (
          <form className="space-y-3" onSubmit={handleSave}>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-800 focus:border-gray-500 focus:bg-gray focus:outline-none focus:ring-2 focus:ring-gray-100 resize-none"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={500}
              rows={3}
              required
            />
            <button className="rounded-full bg-gray-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-gray-600 disabled:opacity-50 cursor-pointer" type="submit" disabled={busy || texto.trim() === ""}>
              {busy ? "A guardar..." : "Guardar"}
            </button>{" "}
            <button type="button" className="rounded-full bg-gray-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-gray-600 disabled:opacity-50 cursor-pointer" onClick={handleCancel} disabled={busy}>
              Cancelar
            </button>
          </form>
        ) : (
          /* pre-wrap mantém as quebras de linha que o autor escreveu */
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
        )}
      </div>
      <footer className="flex items-center space-x-6 pt-2 text-gray-500">
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
