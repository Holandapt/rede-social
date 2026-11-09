import { useState } from "react";
import { likePost, unlikePost } from "../api/posts";
import { getErrorMessages} from "../api/erros"


// O LikeButton guarda o seu próprio estado (curtido e contagem),
// inicializado a partir do post, e atualiza-o com a resposta do servidor,
// que já traz liked_by_me e likes_count. Assim a contagem nunca fica desfasada
// por contas feitas no front. A estrutura é a do FollowButton: busy, error e getErrorMessages.

interface Props {
  postId: number;
  initialLiked: boolean; // estado inicial, vindo do post
  initialCount: number;
}

// Botão de curtir com contagem. Guarda o seu próprio estado e atualiza-o
// com a resposta do servidor, para a contagem nunca ficar desfasada.
export default function LikeButton({postId, initialLiked, initialCount}: Props){
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setErrors] = useState("");

  async function handleClick() {
    setErrors("");
    setBusy(true);
    try {
      const estado = liked ? await unlikePost(postId) : await likePost(postId);
      setLiked(estado.liked_by_me);
      setCount(estado.likes_count);
    } catch (err) {
      setErrors(getErrorMessages(err)[0] ?? "Não foi possivel concluir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="rounded-full bg-transparent px-2 py-1 text-xs font-bold text-gray transition-colors hover:bg-gray-600 hover:text-white disabled:opacity-50 cursor-pointer" onClick={handleClick} disabled={busy} aria-pressed={liked}>
          {liked ? "Descurtir" : "Curtir"} ({count})
      </button>
      {error && <small role="alert">{error}</small>}
    </>
  )
}
