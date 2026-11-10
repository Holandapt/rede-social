import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../api/users";
import { getErrorMessages } from "../api/erros";
import FollowButton from "../components/FollowButton";
import type { PublicUser } from "../types/publicUser";

export default function Users() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Carrega a primeira página quando a página abre.
  useEffect(() => {
    getUsers(1)
      .then((data) => {
        setUsers(data.results);
        setHasMore(data.next !== null);
      })
      .catch((err) => setErrors(getErrorMessages(err)))
      .finally(() => setLoading(false));
  }, []);

  // Carrega a página seguinte e acrescenta ao fim, ignorando utilizadores que já temos.
  async function handleLoadMore() {
    setErrors([]);
    setLoadingMore(true);
    try {
      const data = await getUsers(page + 1);
      setUsers((atuais) => {
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

  // Depois de seguir/deixar de seguir, atualiza a linha e o contador de seguidores.
  function handleFollowChange(id: number, following: boolean) {
    setUsers((atuais) =>
      atuais.map((u) =>
        u.id === id
          ? {
              ...u,
              is_following: following,
              followers_count: u.followers_count + (following ? 1 : -1),
            }
          : u,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="p-6 space-y-8 flex-1">
      <p>
        <Link className="text-gray-600 hover:text-gray-900 font-semibold text-sm" to="/">← Voltar</Link>
      </p>
      <h1>Utilizadores</h1>
      <div className="p-4 flex-1 flex flex-col">
      {errors.length > 0 && (
        <ul role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 space-y-1">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400">
          <p>A carregar...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">
          <p>Ainda não há mais utilizadores.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100" style={{ listStyle: "none", padding: 0 }}>
          {users.map((u) => (
            <li className="py-4 px-2 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-xl" key={u.id}>
              <div className="flex items-center space-x-3 min-w-0 mr-4" >
                {u.avatar && (
                  <img
                    src={u.avatar}
                    alt={`Avatar de ${u.name || u.username}`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                  />
                )}{" "}
                <div className="flex flex-col min-w-0">
                  <strong  className="font-bold text-sm text-gray-900 truncate">{u.name || u.username}</strong> <small className="text-xs text-gray-500 truncate">@{u.username}</small>{" "}
                  <div className="flex space-x-2 text-xs text-gray-400 mt-0.5">
                      <Link className="hover:text-blue-600 hover:underline" to={`/users/${u.id}/followers`}>{u.followers_count} seguidores</Link>
                      <span>·</span>
                      <Link className="hover:text-blue-600 hover:underline" to={`/users/${u.id}/following`}>{u.following_count} a seguir</Link>
                  </div>
                </div>
                </div>
                <div className="shrink-0">
                  <FollowButton
                    userId={u.id}
                    following={u.is_following}
                    onChange={(following) => handleFollowChange(u.id, following)}
                  />
                </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <div className="p-4 text-center mt-auto">
          <button className="mx-auto block rounded-full bg-blue-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 cursor-pointer" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? "A carregar..." : "Carregar mais"}
          </button>
        </div>
      )}
      </div>
      </div>
    </main>
  );
}
