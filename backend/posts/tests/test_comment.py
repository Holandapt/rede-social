import pytest

from posts.models import Comment, Post

# Todos os testes deste ficheiro usam a base de dados
pytestmark = pytest.mark.django_db


def url_comments(post):
    return f"/api/posts/{post.id}/comments/"


def test_comentar_cria_comentario(auth_client, post, user):
    resposta = auth_client.post(url_comments(post), {"content": "Boa publicação!"})

    assert resposta.status_code == 201
    assert resposta.data["content"] == "Boa publicação!"
    assert resposta.data["author"]["username"] == user.username
    assert Comment.objects.filter(post=post, author=user).count() == 1


def test_autor_vem_do_token_e_nao_do_corpo(auth_client, post, user, outro_user):
    # Mesmo que o corpo traga outro autor, o comentário fica em nome de quem fez o pedido
    resposta = auth_client.post(
        url_comments(post), {"content": "Olá", "author": outro_user.id}
    )

    assert resposta.status_code == 201
    assert Comment.objects.get().author == user


def test_comentario_vazio_e_rejeitado(auth_client, post):
    resposta = auth_client.post(url_comments(post), {"content": ""})

    assert resposta.status_code == 400


def test_comentario_demasiado_longo_e_rejeitado(auth_client, post):
    resposta = auth_client.post(url_comments(post), {"content": "a" * 501})

    assert resposta.status_code == 400


def test_comentarios_exigem_autenticacao(api_client, post):
    assert api_client.get(url_comments(post)).status_code == 401
    assert api_client.post(url_comments(post), {"content": "Olá"}).status_code == 401


def test_post_inexistente_devolve_404(auth_client):
    url = "/api/posts/99999/comments/"

    assert auth_client.get(url).status_code == 404
    assert auth_client.post(url, {"content": "Olá"}).status_code == 404


def test_lista_so_do_post_e_do_mais_antigo_para_o_mais_recente(
    auth_client, post, user, outro_user
):
    outro_post = Post.objects.create(author=user, content="Outro post")
    Comment.objects.create(post=post, author=user, content="primeiro")
    Comment.objects.create(post=post, author=outro_user, content="segundo")
    Comment.objects.create(post=outro_post, author=user, content="de outro post")

    resposta = auth_client.get(url_comments(post))

    assert resposta.status_code == 200
    assert [c["content"] for c in resposta.data["results"]] == ["primeiro", "segundo"]


def test_lista_de_comentarios_e_paginada(auth_client, post, user):
    for i in range(11):
        Comment.objects.create(post=post, author=user, content=f"comentário {i}")

    pagina1 = auth_client.get(url_comments(post))
    pagina2 = auth_client.get(url_comments(post), {"page": 2})

    assert pagina1.data["count"] == 11
    assert len(pagina1.data["results"]) == 10
    assert pagina1.data["next"] is not None
    assert len(pagina2.data["results"]) == 1


def test_post_traz_comments_count(auth_client, post, user):
    Comment.objects.create(post=post, author=user, content="um")
    Comment.objects.create(post=post, author=user, content="dois")

    resposta = auth_client.get(f"/api/posts/{post.id}/")

    assert resposta.data["comments_count"] == 2
