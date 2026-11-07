from django.contrib.auth import get_user_model
from django.urls import reverse

from posts.models import Post
from users.models import Follow

User = get_user_model()


def test_feed_mostra_meus_posts_e_de_quem_sigo(auth_client, user, outro_user, password):
    terceiro = User.objects.create_user(username="carla", password=password)
    Follow.objects.create(follower=user, following=outro_user)
    visivel = Post.objects.create(author=outro_user, content="de quem eu sigo")
    Post.objects.create(author=terceiro, content="de alguem que nao sigo")
    meu = Post.objects.create(author=user, content="meu proprio post")

    resposta = auth_client.get(reverse("feed"))

    assert resposta.status_code == 200
    # Mais recente primeiro: o meu post foi criado depois do visível
    assert [p["id"] for p in resposta.data["results"]] == [meu.id, visivel.id]


def test_feed_vem_ordenado_do_mais_recente_para_o_mais_antigo(
    auth_client, user, outro_user
):
    Follow.objects.create(follower=user, following=outro_user)
    primeiro = Post.objects.create(author=outro_user, content="primeiro")
    segundo = Post.objects.create(author=outro_user, content="segundo")

    resposta = auth_client.get(reverse("feed"))

    assert [p["id"] for p in resposta.data["results"]] == [segundo.id, primeiro.id]


def test_feed_e_paginado(auth_client, user, outro_user):
    Follow.objects.create(follower=user, following=outro_user)
    for i in range(11):
        Post.objects.create(author=outro_user, content=f"post {i}")

    resposta = auth_client.get(reverse("feed"))

    assert resposta.data["count"] == 11
    assert len(resposta.data["results"]) == 10
    assert resposta.data["next"] is not None


def test_feed_vazio_quando_nao_sigo_ninguem(auth_client, outro_user):
    Post.objects.create(author=outro_user, content="ninguem me segue a mim")

    resposta = auth_client.get(reverse("feed"))

    assert resposta.status_code == 200
    assert resposta.data["count"] == 0


def test_feed_exige_autenticacao(api_client):
    assert api_client.get(reverse("feed")).status_code == 401


def test_feed_inclui_meus_posts_mesmo_sem_seguir_ninguem(auth_client, user):
    Post.objects.create(author=user, content="so eu")

    resposta = auth_client.get(reverse("feed"))

    assert resposta.data["count"] == 1


def test_feed_nao_duplica_os_meus_posts(auth_client, user, outro_user):
    # Seguimento nos dois sentidos: um join simples repetiria o meu post
    Follow.objects.create(follower=user, following=outro_user)
    Follow.objects.create(follower=outro_user, following=user)
    meu = Post.objects.create(author=user, content="meu proprio post")

    resposta = auth_client.get(reverse("feed"))

    assert [p["id"] for p in resposta.data["results"]] == [meu.id]
