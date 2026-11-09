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
    <main>
      <p>
        <Link to="/">← Voltar</Link>
      </p>
      <h1>Utilizadores</h1>
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {loading ? (
        <p>A carregar...</p>
      ) : users.length === 0 ? (
        <p>Ainda não há mais utilizadores.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((u) => (
            <li key={u.id}>
              {u.avatar && (
                <img
                  src={u.avatar}
                  alt={`Avatar de ${u.name || u.username}`}
                  width={40}
                  height={40}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              )}{" "}
              <strong>{u.name || u.username}</strong> <small>@{u.username}</small>{" "}
              <small>
                <Link to={`/users/${u.id}/followers`}>{u.followers_count} seguidores</Link> ·{" "}
                <Link to={`/users/${u.id}/following`}>{u.following_count} a seguir</Link>
              </small>{" "}
              <FollowButton
                userId={u.id}
                following={u.is_following}
                onChange={(following) => handleFollowChange(u.id, following)}
              />
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <button onClick={handleLoadMore} disabled={loadingMore}>
          {loadingMore ? "A carregar..." : "Carregar mais"}
        </button>
      )}
    </main>
  );
}
