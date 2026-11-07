from django.urls import reverse

from users.models import Follow


def test_perfil_publico_tem_contadores_e_is_following(auth_client, user, outro_user):
    Follow.objects.create(follower=user, following=outro_user)

    resposta = auth_client.get(reverse("user-detail", args=[outro_user.id]))

    assert resposta.status_code == 200
    assert resposta.data["followers_count"] == 1
    assert resposta.data["following_count"] == 0
    assert resposta.data["is_following"] is True


def test_contadores_respeitam_a_direcao(auth_client, user, outro_user):
    # outro_user segue user (e não o contrário)
    Follow.objects.create(follower=outro_user, following=user)

    me = auth_client.get("/api/auth/me/")
    perfil = auth_client.get(reverse("user-detail", args=[outro_user.id]))

    # Do ponto de vista de user: tem 1 seguidor e não segue ninguém
    assert me.data["followers_count"] == 1
    assert me.data["following_count"] == 0
    # outro_user segue 1 pessoa, não tem seguidores, e user não o segue
    assert perfil.data["followers_count"] == 0
    assert perfil.data["following_count"] == 1
    assert perfil.data["is_following"] is False


def test_perfil_publico_nao_expoe_email(auth_client, outro_user):
    resposta = auth_client.get(reverse("user-detail", args=[outro_user.id]))

    assert resposta.status_code == 200
    assert "email" not in resposta.data


def test_perfil_publico_inexistente_devolve_404(auth_client):
    resposta = auth_client.get(reverse("user-detail", args=[99999]))

    assert resposta.status_code == 404


def test_lista_exclui_o_proprio_e_e_paginada(auth_client, user, outro_user):
    resposta = auth_client.get(reverse("user-list"))

    assert resposta.status_code == 200
    # Paginação global: count + results
    assert resposta.data["count"] == 1
    assert [u["id"] for u in resposta.data["results"]] == [outro_user.id]


def test_lista_e_perfil_exigem_autenticacao(api_client, outro_user):
    assert api_client.get(reverse("user-list")).status_code == 401
    detalhe = reverse("user-detail", args=[outro_user.id])
    assert api_client.get(detalhe).status_code == 401
