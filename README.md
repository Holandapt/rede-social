# Rede Social

Projeto final do curso Full Stack Python: uma rede social com API em Django REST e front-end em React.

## Em produção

- Aplicação: https://rede-social-lac.vercel.app
- API: https://holandaptr.pythonanywhere.com/api/

## Funcionalidades

- Registo, login (JWT com refresh automático) e alteração de palavra-passe
- Perfil próprio com nome e avatar (até 2 MB)
- Publicações de texto (até 500 caracteres): só o autor edita e apaga
- Descobrir utilizadores, seguir e deixar de seguir
- Perfil público com número de seguidores e de seguidos, e listas de seguidores e seguidos (API)
- Feed com as publicações próprias e de quem se segue, paginado
- Curtidas nas publicações (uma por utilizador) com contagem
- Comentários nas publicações, paginados

## Stack

- **Back-end:** Python 3.12 ou superior, Django 6.1, Django REST Framework, SimpleJWT, django-cors-headers, Pillow, python-dotenv (gerido com Poetry)
- **Front-end:** Vite, React 19, TypeScript, react-router-dom 7, axios, ESLint
- **Testes e formatação:** pytest, pytest-django, Black

## Estrutura

- `backend/`: API em Django REST (projeto `config/`, apps `users/` e `posts/`)
- `frontend/`: aplicação em React

## Como correr localmente

### Back-end

```powershell
cd backend
poetry install
poetry run python manage.py migrate
poetry run python manage.py runserver
```

A API fica em http://localhost:8000/api/.

### Front-end

```powershell
cd frontend
npm install
npm run dev
```

A aplicação fica em http://localhost:5173 e fala por omissão com a API local.

## Variáveis de ambiente

### Back-end (`backend/.env`, opcional em desenvolvimento)

| Variável | Para que serve | Valor por omissão |
|---|---|---|
| `SECRET_KEY` | Chave secreta do Django | valor de desenvolvimento (obrigatório definir em produção) |
| `DEBUG` | Modo de depuração | `True` |
| `ALLOWED_HOSTS` | Domínios permitidos, separados por vírgulas | vazio |
| `CORS_ALLOWED_ORIGINS` | Origens do front-end autorizadas, separadas por vírgulas | `http://localhost:5173` |

O ficheiro `.env` não vai para o Git.

### Front-end

| Variável | Para que serve | Valor por omissão |
|---|---|---|
| `VITE_API_URL` | URL base da API | API local |

## API

Todos os endpoints, exceto registo, login e refresh, exigem o cabeçalho `Authorization: Bearer <token>`. As listas são paginadas (10 por página, parâmetro `?page=N`).

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register/` | Registo |
| POST | `/api/auth/login/` | Login (devolve `access` e `refresh`) |
| POST | `/api/auth/refresh/` | Renova o token de acesso |
| GET, PATCH | `/api/auth/me/` | Perfil do utilizador autenticado |
| POST | `/api/auth/change-password/` | Alterar palavra-passe |
| GET | `/api/users/` | Lista de utilizadores (exclui o próprio) |
| GET | `/api/users/<id>/` | Perfil público |
| POST, DELETE | `/api/users/<id>/follow/` | Seguir e deixar de seguir |
| GET | `/api/users/<id>/followers/` | Seguidores do utilizador |
| GET | `/api/users/<id>/following/` | Quem o utilizador segue |
| GET, POST | `/api/posts/` | Listar e criar publicações |
| GET, PATCH, DELETE | `/api/posts/<id>/` | Detalhe, edição e remoção (edição e remoção só pelo autor) |
| GET | `/api/feed/` | Feed do utilizador |
| POST, DELETE | `/api/posts/<id>/like/` | Curtir e descurtir |
| GET, POST | `/api/posts/<id>/comments/` | Listar e criar comentários |

## Testes

```powershell
cd backend
poetry run pytest
```

## Deploy

- **Back-end:** PythonAnywhere (plano gratuito, SQLite). Para publicar uma versão nova: `git pull`, `pip install -r requirements.txt` se mudaram dependências, `python manage.py migrate`, `collectstatic` se for preciso e Reload no separador Web.
- **Front-end:** Vercel, ligado ao repositório com Root Directory `frontend`. Cada merge no `main` faz deploy automático. Variável `VITE_API_URL` apontada para a API em produção, e `frontend/vercel.json` com rewrite para `index.html`.
