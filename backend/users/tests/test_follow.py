import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from users.models import Follow

User = get_user_model()


def test_seguir_cria_a_relacao(auth_client, user, outro_user):
    resposta = auth_client.post(reverse("user-follow", args=[outro_user.id]))

    assert resposta.status_code == 201
    assert Follow.objects.filter(follower=user, following=outro_user).exists()


def test_seguir_duas_vezes_nao_duplica(auth_client, outro_user):
    url = reverse("user-follow", args=[outro_user.id])

    primeira = auth_client.post(url)
    segunda = auth_client.post(url)

    assert primeira.status_code == 201
    assert segunda.status_code == 200
    assert Follow.objects.count() == 1


def test_nao_se_pode_seguir_a_si_proprio(auth_client, user):
    resposta = auth_client.post(reverse("user-follow", args=[user.id]))

    assert resposta.status_code == 400
    assert Follow.objects.count() == 0


def test_seguir_utilizador_inexistente_devolve_404(auth_client):
    resposta = auth_client.post(reverse("user-follow", args=[99999]))

    assert resposta.status_code == 404


def test_deixar_de_seguir_remove_a_relacao(auth_client, user, outro_user):
    Follow.objects.create(follower=user, following=outro_user)

    resposta = auth_client.delete(reverse("user-follow", args=[outro_user.id]))

    assert resposta.status_code == 204
    assert Follow.objects.count() == 0


def test_deixar_de_seguir_quem_nao_seguia_devolve_204(auth_client, outro_user):
    resposta = auth_client.delete(reverse("user-follow", args=[outro_user.id]))

    assert resposta.status_code == 204


def test_seguir_exige_autenticacao(api_client, outro_user):
    url = reverse("user-follow", args=[outro_user.id])

    assert api_client.post(url).status_code == 401
    assert api_client.delete(url).status_code == 401
