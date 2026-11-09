import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFollowers, getFollowing } from "../api/users";
import { getErrorMessages } from "../api/erros";
import type { PublicUser } from "../types/publicUser";

interface Props {
  // Decide qual das duas listas esta página mostra.
  tipo: "followers" | "following";
}

// Lista paginada de seguidores ou de seguidos de um utilizador (o id vem do URL).
export default function FollowList({tipo}:Props) {
  const { id } = useParams()
  const userId = Number(id);

  const [users, setUsers] = useState<PublicUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Escolhe a função da API conforme o tipo de lista.
  const carregar = tipo === "followers" ? getFollowers : getFollowing;

  // Carrega a primeira página quando a página abre.
  useEffect(()=>{
    carregar(userId, 1)
    .then((data)=>{
      setUsers(data.results);
      setHasMore(data.next !== null);
    })
    .catch((e)=> setErrors(getErrorMessages(e)))
    .finally(()=> setLoading(false))
  }, [carregar, userId])

   // Carrega a página seguinte e acrescenta ao fim, ignorando utilizadores que já temos.
  async function handleLoadMore() {
    setErrors([]);
    setLoadingMore(true);
    try {
      const data = await carregar(userId, page + 1);
      // Quando atualizamos um estado que depende do valor anterior, passamos uma função de callback.
      // "atuais" representa a lista de utilizadores que já está a ser mostrada no ecrã neste preciso momento.
      setUsers((atuais) => {
        // Vai à lista atual e extrai apenas os IDs de cada utilizador.
        const ids = new Set(atuais.map((u) => u.id));
        return [...atuais, ...data.results.filter((u) => !ids.has(u.id))];
      });
      setPage(page + 1);
      setHasMore(data.next !== null);
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main>
      <p>
        <Link to="/">← Voltar</Link>
      </p>
      <h1>{tipo === "followers" ? "Seguidores":"A seguir"}</h1>
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((message)=>(
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {loading ? (
        <p>A carregar...</p>
      ): users.length === 0 ? (
        <p>
          {tipo === "followers" ? "Ainda não tem seguidores": "Ainda não segue ninguém"}
        </p>
        ): (
          <ul style={{listStyle: "none", padding:0}}>
            {users.map((u)=>(
              <li key={u.id}>
                {u.avatar && (
                  <img src={u.avatar}
                  alt={`Avatar de ${u.name || u.username}`}
                  width={40}
                  height={40}
                  style={{ objectFit: "cover", borderRadius: "50%" }}/>
                )}{" "}
                <strong>{u.name || u.username}</strong><small>@{u.username}</small>
              </li>
            ))}
            </ul>
        )}
        {hasMore && (
          <button onClick={handleLoadMore} disabled={loading}>
            {loadingMore ? "A carregar": "Carregar mais"}
          </button>
        )}
    </main>
  )
}

