import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { getErrorMessages } from "../api/erros";
import { getFeed } from "../api/posts";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import type { Post } from "../types/post";
import type { User } from "../types/user";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedErrors, setFeedErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  // Esse trecho de código é executado quando o componente é montado.
  // Ele faz uma requisição GET para a rota de perfil da API para obter os dados do usuário logado.
  // Se a requisição for bem-sucedida, ele atualiza o estado do usuário com os dados retornados.
  // Caso contrário, ele navega para a página de login.
  // Em paralelo, vai buscar a primeira página do feed.
  useEffect(() => {
    api.get<User>("/auth/me/")
    // Extrai os dados da resposta (data) e atualiza o estado do utilizador (setUser(data)
      .then(({ data }) => setUser(data))
      .catch(() => navigate("/login"));
    // buscar a primeira página de posts do feed.
    getFeed(1)
      // Guarda a lista de posts recebidos no estado.
      .then((data) => {
        setPosts(data.results);
        // Define a página atual como 1.
        setPage(1);
        // Verifica se existe uma próxima página
        setHasMore(data.next !== null);
      })
      .catch((err) => setFeedErrors(getErrorMessages(err)))
      .finally(() => setLoadingFeed(false));
  }, [navigate]);

  // Essa função é chamada quando o botão de logout é clicado.
  // Ela remove os tokens de acesso e refresh do localStorage e navega para a página de login.
  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  // Uma publicação nova entra no topo da lista (sem repetir se já lá estiver).
  function handleCreated(post: Post) {
    // O método .filter percorre a lista atual e remove qualquer post que já tenha o mesmo ID do novo post.
    setPosts((atuais) => [post, ...atuais.filter((p) => p.id !== post.id)]);
  }

  // Carrega a página seguinte e acrescenta ao fim, ignorando posts que já temos.
  async function handleLoadMore() {
    setFeedErrors([]);
    setLoadingMore(true);
    try {
      const data = await getFeed(page + 1);
      setPosts((atuais) => {
        const ids = new Set(atuais.map((p) => p.id));
        return [...atuais, ...data.results.filter((p) => !ids.has(p.id))];
      });
      setPage(page + 1);
      setHasMore(data.next !== null);
    } catch (err) {
      setFeedErrors(getErrorMessages(err));
    } finally {
      setLoadingMore(false);
    }
  }

  if (!user) return <p> A carregar...</p>;

  return (
    <main>
      <h1>Olá, {user.username}!</h1>
      <p>
        <Link to="/profile">O meu perfil</Link>
      </p>
      <p>
        <Link to="/users">Descobrir utilizadores</Link>
      </p>
      <CreatePost onCreated={handleCreated} />
      <h2>Feed</h2>
      {feedErrors.length > 0 && (
        <ul role="alert">
          {feedErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {loadingFeed ? (
        <p>A carregar o feed...</p>
      ) : posts.length === 0 ? (
        <p>Ainda não há publicações. Publica algo ou segue outros utilizadores.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <button onClick={handleLoadMore} disabled={loadingMore}>
          {loadingMore ? "A carregar..." : "Carregar mais"}
        </button>
      )}
      <p>
        <button onClick={handleLogout}>Sair</button>
      </p>
    </main>
  );
}
