from django.urls import reverse

from users.models import Follow


def test_seguidores_lista_quem_segue_o_utilizador(auth_client, user, outro_user):
    Follow.objects.create(follower=user, following=outro_user)

    # o reverse cria a rota dinamica e o args poe o id como parametro pra rota
    resposta = auth_client.get(reverse("user-followers", args=[outro_user.id]))

    assert resposta.status_code == 200
    assert resposta.data["count"] == 1
    # Isto é uma list comprehension em Python
    # Ela percorre cada elemento u (cada utilizador) dentro da lista de resultados e
    # extrai apenas o seu ID (u["id"]), transformando a lista de dicionários complexos
    # numa lista simples de números inteiros
    assert [u["id"] for u in resposta.data["results"]] == [user.id]


def test_seguidos_lista_quem_o_utilizador_segue(auth_client, user, outro_user):
    Follow.objects.create(follower=user, following=outro_user)

    resposta = auth_client.get(reverse("user-following", args=[user.id]))

    assert resposta.status_code == 200
    assert resposta.data["count"] == 1
    assert [u["id"] for u in resposta.data["results"]] == [outro_user.id]


def test_listas_respeitam_a_direcao(auth_client, user, outro_user):
    # user segue outro_user: as listas "opostas" têm de ficar vazias
    Follow.objects.create(follower=user, following=outro_user)

    seguidores_de_user = auth_client.get(reverse("user-followers", args=[user.id]))
    seguidos_de_outro = auth_client.get(reverse("user-following", args=[outro_user.id]))

    assert seguidores_de_user.data["count"] == 0
    assert seguidos_de_outro.data["count"] == 0


def test_listas_de_utilizador_inexistente_devolvem_404(auth_client):
    assert auth_client.get(reverse("user-followers", args=[99999])).status_code == 404
    assert auth_client.get(reverse("user-following", args=[99999])).status_code == 404


def test_listas_exigem_autenticacao(api_client, outro_user):
    seguidores = reverse("user-followers", args=[outro_user.id])
    seguidos = reverse("user-following", args=[outro_user.id])

    assert api_client.get(seguidores).status_code == 401
    assert api_client.get(seguidos).status_code == 401
