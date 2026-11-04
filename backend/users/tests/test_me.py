import os
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

ME_URL = "/api/auth/me/"


# Gera uma imagem PNG em memória. Com size=None é um quadrado azul pequeno;
# com um tamanho em bytes, usa ruído aleatório (que não comprime) para passar esse tamanho.
def make_png(name="foto.png", size=None):
    buffer = BytesIO()
    if size is None:
        Image.new("RGB", (20, 20), "blue").save(buffer, format="PNG")
    else:
        Image.frombytes("RGB", (1000, 1000), os.urandom(size)).save(
            buffer, format="PNG"
        )
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/png")


def test_requires_authentication(api_client):
    response = api_client.get(ME_URL)
    assert response.status_code == 401


def test_get_returns_own_profile(auth_client):
    response = auth_client.get(ME_URL)
    assert response.status_code == 200
    assert response.data["username"] == "Lucas"
    assert response.data["email"] == "lucas@example.com"


def test_patch_updates_name(auth_client, user):
    response = auth_client.patch(ME_URL, {"name": "Lucas"}, format="json")
    assert response.status_code == 200
    assert response.data["name"] == "Lucas"
    user.refresh_from_db()
    assert user.first_name == "Lucas"


def test_username_is_read_only(auth_client, user):
    response = auth_client.patch(
        ME_URL, {"username": "outro", "name": "Lucas"}, format="json"
    )
    assert response.status_code == 200
    user.refresh_from_db()
    # O nome mudou, mas o username continua o original.
    assert user.first_name == "Lucas"
    assert user.username == "Lucas"


def test_email_is_read_only(auth_client, user):
    auth_client.patch(ME_URL, {"email": "outro@example.com"}, format="json")
    user.refresh_from_db()
    assert user.email == "lucas@example.com"


# A fixture "settings" do pytest-django altera as settings só durante este teste.
# Com tmp_path, o avatar é gravado numa pasta temporária e não suja a pasta media/.
def test_patch_updates_avatar(auth_client, user, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    response = auth_client.patch(ME_URL, {"avatar": make_png()}, format="multipart")
    assert response.status_code == 200
    assert response.data["avatar"].endswith(".png")
    user.refresh_from_db()
    assert user.avatar
    assert (tmp_path / user.avatar.name).exists()


def test_avatar_larger_than_2mb_is_rejected(auth_client, user):
    response = auth_client.patch(
        ME_URL, {"avatar": make_png("grande.png", size=3_000_000)}, format="multipart"
    )
    assert response.status_code == 400
    assert "avatar" in response.data
    user.refresh_from_db()
    assert not user.avatar
