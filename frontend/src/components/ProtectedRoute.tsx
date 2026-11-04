import { Navigate, Outlet, useLocation} from 'react-router-dom';

// Navigate: Componente usado para redirecionar o usuário programaticamente.
// Outlet: Componente que funciona como um "espaço reservado" (placeholder) para renderizar as rotas filhas protegidas.
// useLocation: Hook que retorna informações sobre a URL atual (como o caminho exato onde o usuário está).

// Protege um grupo de rotas: se não houver token de acesso, redireciona para o login.
// O <Outlet /> é o lugar onde o React Router renderiza a rota filha (Home, Profile, etc.).
export default function ProtectedRoute() {
  // Salva a localização atual na constante location.
  // Isso é útil para lembrar de qual página o usuário foi "expulso" ao tentar acessá-la sem login.
  const location = useLocation();
  // Verifica se existe um item chamado "access" (geralmente o token JWT ou de autenticação) armazenado no localStorage do navegador.
  const IsAuthenticated = Boolean(localStorage.getItem('access'));

  if (!IsAuthenticated) {
    // Se o usuário não estiver autenticado, redireciona para a página de login.
    // O estado { from: location } é passado para que, após o login, o usuário possa ser redirecionado de volta para a página que tentou acessar.
    return <Navigate to="/login" replace state={{ from: location }}  />;
  }
  return <Outlet />; // Se o usuário estiver autenticado, renderiza a rota filha protegida.
}
