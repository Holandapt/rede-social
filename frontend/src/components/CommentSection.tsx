import { useState } from "react";
import type { FormEvent } from "react";
import { createComment, getComments } from "../api/comments";
import { getErrorMessages } from "../api/erros";
import type { Comment } from "../types/comments";

interface Props {
  postId: number;
  initialCount: number; // comments_count do post
}

const MAX_LENGTH = 500;

// Botão "Comentários (N)" que abre a lista e o formulário.
// A lista só é pedida ao servidor na primeira vez que se abre.
export default function CommentSection({postId, initialCount}:Props){

  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0); // última página carregada (0 = nenhuma)
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadPage(next: number){
    setError("");
    setLoading(true);

    try {
      const data = await getComments(postId, next);
      // A página 1 substitui a lista; as seguintes acrescentam
      setComments((prev) =>
        // Se for a página 1 (next === 1), significa que é o carregamento inicial (ou um refresh).
        // Se for da página 2 em diante, o código usa o operador spread para acrescentar
        // os novos comentários no final da lista existente, criando o efeito de paginação cumulativa.
      next === 1 ? data.results : [...prev, ...data.results],
      );
      setPage(next);
      // Verifica se a resposta da API possui uma propriedade next preenchida com um link
      // para a próxima página
      setHasMore(data.next !== null);
      setCount(data.count);
    } catch (err) {
      setError(getErrorMessages(err)[0] ?? "Não foi possível carregar.");
    } finally {
      setLoading(false);
    }
  }

    function toggle() {
    const abrir = !open;
    setOpen(abrir);
    // Só vai buscar a lista na primeira vez que se abre
    // A condição só é verdadeira se o utilizador está a abrir o painel,
    // e é a primeira vez que o faz.
    if (abrir && page === 0) {
      // é uma função assíncrona (async).
      void loadPage(1);
    }
  }

    async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setError("");
    setNotice("");
    setSending(true);
    try {
      const novo = await createComment(postId, content);
      setCount((c) => c + 1);
      setText("");
      if (hasMore) {
        // Os comentários vão do mais antigo ao mais recente: o novo fica na última página
        setNotice("Comentário publicado. Carrega mais comentários para o ver na lista.");
      } else {
        setComments((prev) => [...prev, novo]);
      }
    } catch (err) {
      setError(getErrorMessages(err)[0] ?? "Não foi possível comentar.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <button onClick={toggle} aria-expanded={open}>
        Comentários ({count})
      </button>
      {open && (
        <div>
          {loading && comments.length === 0 && <p>A carregar...</p>}
          {!loading && page > 0 && comments.length === 0 && (
            <p>Ainda nao ha comentários</p>
          )}
          <ul>
            {comments.map((c) => {
              const nome = c.author.name || c.author.username;
              return (
                <li key={c.id}>
                  <strong>{nome}</strong>{" "}
                  <small>
                    @{c.author.username} ·{" "}
                    { new Date(c.created_at).toLocaleString("pt-PT")}
                  </small>
                  {/* pre-wrap mantém as quebras de linha que o autor escreveu */}
                  <p style={{whiteSpace: "pre-wrap"}}>{c.content}</p>
                </li>
              )
            })}
          </ul>
          {hasMore && (
            <button onClick={() => void loadPage(page + 1)} disabled={loading}>
              {loading ? "..." : "Carregar mais comentários"}
            </button>
          )}
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={2}
              aria-label="Novo comentário"
            />
            <small>
              {text.length}/{MAX_LENGTH}
            </small>{" "}
            <button
              type="submit"
              disabled={sending || loading || !text.trim()}
            >
              {sending ? "..." : "Comentar"}
            </button>
          </form>
          {notice && <small>{notice}</small>}
          {error && <small role="alert"> {error}</small>}
        </div>
      )}
    </section>
  );
}
