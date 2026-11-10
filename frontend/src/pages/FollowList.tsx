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
    <main className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="p-6 space-y-8 flex-1">
        <p>
          <Link className="text-gray-600 hover:text-gray-900 font-semibold text-sm" to="/profile">← Voltar</Link>
        </p>
        <h1 className="text-lg font-bold text-gray-900">{tipo === "followers" ? "Seguidores":"A seguir"}</h1>
        <div className="p-4 flex-1 flex flex-col">
          {errors.length > 0 && (
            <ul role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 space-y-1">
              {errors.map((message)=>(
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">
              <p>A carregar...</p>
            </div>
          ): users.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              <p>
                {tipo === "followers" ? "Ainda não tem seguidores": "Ainda não segue ninguém"}
              </p>
            </div>
            ): (
              <ul className="divide-y divide-gray-100" style={{listStyle: "none", padding:0}}>
                {users.map((u)=>(
                  <li key={u.id} className="py-4 px-2 flex items-center justify-center hover:bg-gray-50/50 transition-colors rounded-xl">
                    <div className="flex items-center space-x-3 min-w-0">
                      {u.avatar && (
                        <img src={u.avatar}
                        alt={`Avatar de ${u.name || u.username}`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                        style={{ objectFit: "cover", borderRadius: "50%" }}/>
                      )}
                      <div>
                        <strong className="font-bold text-sm mr-4 text-gray-900 truncate">{u.name || u.username}</strong><small className="text-xs text-gray-500 truncate">@{u.username}</small>
                      </div>
                    </div>
                  </li>
                ))}
                </ul>
            )}
            {hasMore && (
              <div>
                <button onClick={handleLoadMore} disabled={loading}>
                  {loadingMore ? "A carregar": "Carregar mais"}
                </button>
              </div>
            )}
        </div>
      </div>
    </main>
  )
}

