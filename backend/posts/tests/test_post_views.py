import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from posts.models import Post

User = get_user_model()


def test_criar_post_define_autor_pelo_token(auth_client, user):
    resposta = auth_client.post(
        reverse("post-list"), {"content": "Ola Mundo"}, format="json"
    )

    assert resposta.status_code == 201
    assert resposta.data["author"]["username"] == user.username
    assert Post.objects.count() == 1


@pytest.mark.parametrize("conteudo", ["", "a" * 501])
def test_criar_post_vazio_ou_demasiado_longo_devolve_400(auth_client, conteudo):
    resposta = auth_client.post(
        reverse("post-list"), {"content": conteudo}, format="json"
    )

    assert resposta.status_code == 400
    assert Post.objects.count() == 0


def test_listar_posts_paginado_com_mais_recentes_primeiro(auth_client, user):
    Post.objects.create(author=user, content="antigo")
    Post.objects.create(author=user, content="recente")

    resposta = auth_client.get(reverse("post-list"))

    assert resposta.status_code == 200
    assert resposta.data["count"] == 2
    assert resposta.data["results"][0]["content"] == "recente"


def test_autor_edita_o_proprio_post(auth_client, post):
    resposta = auth_client.patch(
        reverse("post-detail", args=[post.id]), {"content": "editado"}, format="json"
    )

    assert resposta.status_code == 200
    post.refresh_from_db()
    assert post.content == "editado"


def test_autor_apaga_o_proprio_post(auth_client, post):
    resposta = auth_client.delete(reverse("post-detail", args=[post.id]))

    assert resposta.status_code == 204
    assert not Post.objects.filter(id=post.id).exists()


def test_outro_utilizador_nao_edita_nem_apaga(outro_client, post):
    url = reverse("post-detail", args=[post.id])

    editar = outro_client.patch(url, {"content": "hack"}, format="json")
    apagar = outro_client.delete(url)

    assert editar.status_code == 403
    assert apagar.status_code == 403
    post.refresh_from_db()
    assert post.content == "Post do Lucas"


def test_sem_autenticacao_devolve_401(api_client, post):
    assert api_client.get(reverse("post-list")).status_code == 401
    assert (
        api_client.post(
            reverse("post-list"), {"content": "x"}, format="json"
        ).status_code
        == 401
    )
