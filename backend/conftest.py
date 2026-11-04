import pytest
from rest_framework.test import APIClient

from users.models import User


# Usa um hasher rápido só nos testes (o PBKDF2 real é lento de propósito).
@pytest.fixture(autouse=True)
def fast_password_hasher(settings):
    settings.PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]


# Senha usada pelo usuário de teste. É uma fixture para os testes a poderem receber como argumento.
@pytest.fixture
def password():
    return "SenhaAtual#2026"


# Cria um usuário na base de dados de teste. O argumento "db" é a fixture do pytest-django
# que dá acesso à base de dados (sem ela, o teste não pode tocar no banco).
@pytest.fixture
def user(db, password):
    return User.objects.create_user(
        username="Lucas",
        email="lucas@example.com",
        password=password,
    )


# Cliente HTTP sem autenticação.
# A fixture api_client() retorna uma instância do APIClient do DRF, que é usada para
# simular requisições HTTP nos testes.
@pytest.fixture
def api_client():
    return APIClient()


# Cliente HTTP já autenticado como o usuário de teste (sem passar pelo login JWT).
# O método force_authenticate() do DRF é usado para simular que o usuário está autenticado.
@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client
