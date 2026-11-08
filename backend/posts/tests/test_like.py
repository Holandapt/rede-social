import pytest

# Permite o acesso ao banco de dados para todos os testes dentro desse arquivo específico.
pytestmark = pytest.mark.django_db


# função auxiliar (helper) criada para gerar dinamicamente a URL da API de curtidas de um
# post específico durante os testes.
def url_like(post):
    return f"/api/posts/{post.id}/like/"


def test_curtir_cria_curtida(auth_client, post):
    resposta = auth_client.post(url_like(post))

    assert resposta.status_code == 201
    assert resposta.data == {"liked_by_me": True, "likes_count": 1}


def test_curtir_duas_vezes_nao_duplica(auth_client, post):
    auth_client.post(url_like(post))
    resposta = auth_client.post(url_like(post))

    # Segunda vez: já existia, por isso 200 e a contagem continua em 1
    assert resposta.status_code == 200
    assert resposta.data["likes_count"] == 1


def test_descurtir_remove_curtida(auth_client, post):
    auth_client.post(url_like(post))
    resposta = auth_client.delete(url_like(post))

    assert resposta.status_code == 200
    assert resposta.data == {"liked_by_me": False, "likes_count": 0}


def test_descurtir_sem_ter_curtido_nao_da_erro(auth_client, post):
    resposta = auth_client.delete(url_like(post))

    assert resposta.status_code == 200
    assert resposta.data["likes_count"] == 0


def test_curtir_exige_autenticacao(api_client, post):
    resposta = api_client.post(url_like(post))

    assert resposta.status_code == 401


def test_curtir_post_inexistente_devolve_404(auth_client):
    resposta = auth_client.post("/api/posts/99999/like/")

    assert resposta.status_code == 404


def test_post_traz_contagem_e_liked_by_me_por_utilizador(
    auth_client, outro_client, post
):
    # O "user" curte; o "outro_user" não
    auth_client.post(url_like(post))

    meu = auth_client.get(f"/api/posts/{post.id}/")
    dele = outro_client.get(f"/api/posts/{post.id}/")

    assert meu.data["likes_count"] == 1
    assert meu.data["liked_by_me"] is True
    assert dele.data["likes_count"] == 1
    assert dele.data["liked_by_me"] is False


def test_curtidas_de_varios_utilizadores_somam(auth_client, outro_client, post):
    auth_client.post(url_like(post))
    resposta = outro_client.post(url_like(post))

    assert resposta.data["likes_count"] == 2
