import { useState, type FormEvent } from "react";
import { createPost } from "../api/posts";
import { getErrorMessages } from "../api/erros";
import type { Post } from "../types/post";

// Limite de caracteres, igual ao do back-end.
const MAX_LENGTH = 500;

interface Props {
  // Chamado com a postagem criada, para a página poder atualizar a lista.
  // Quando executada, ela obrigatoriamente espera receber um parâmetro chamado post do tipo Post.
  onCreated?: (post: Post) => void;
}

export default function CreatePost({ onCreated }: Props) {
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSuccess("");

    // O back-end também valida, mas poupamos um pedido a um texto vazio.
    // O .trim() remove espaços em branco nas pontas. Se o utilizador tentar enviar uma publicação
    // vazia ou só com espaços,o código bloqueia o envio imediatamente e mostra o erro,
    // poupando um pedido desnecessário ao servidor.
    if (!content.trim()) {
      setErrors(["Escreve alguma coisa antes de publicar."]);
      return;
    }
    setSaving(true);
    try {
      const post = await createPost(content.trim());
      setContent("");
      setSuccess("Publicado.");
      onCreated?.(post);
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      <label className="text-md mb-4 font-bold text-gray-600">
        Nova publicação:
        <textarea className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-800 focus:border-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-100" value={content} onChange={(e)=>setContent(e.target.value)} maxLength={MAX_LENGTH} rows={3}/>
      </label>
      <div className="flex items-center justify-between pt-1">
        <small>
          {content.length}/{MAX_LENGTH}
        </small>
        {errors.length > 0 && (
          <ul role="alert">
            {errors.map((message)=>(
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
        {success && <p role="status">{success}</p>}
        <button className="rounded-full bg-gray-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-gray-600 disabled:opacity-50 cursor-pointer" type="submit" disabled={saving}>
          {saving ? "A publicar..." : "Publicar"}
        </button>
      </div>
    </form>
  )
}
