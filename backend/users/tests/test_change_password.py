import pytest

URL = "/api/auth/change-password/"
NEW_PASSWORD = "NovaSenha#2026xyz"


def test_requires_authentication(api_client, password):
    response = api_client.post(
        URL, {"old_password": password, "new_password": NEW_PASSWORD}, format="json"
    )
    assert response.status_code == 401


def test_wrong_current_password_is_rejected(auth_client, user, password):
    response = auth_client.post(
        URL, {"old_password": "errada", "new_password": NEW_PASSWORD}, format="json"
    )
    assert response.status_code == 400
    assert "old_password" in response.data
    # A senha não pode ter mudado.
    user.refresh_from_db()
    assert user.check_password(password)


# O parametrize corre o mesmo teste uma vez por cada valor da lista.
@pytest.mark.parametrize("weak_password", ["123", "12345678", "password", "ana"])
def test_weak_new_password_is_rejected(auth_client, user, password, weak_password):
    response = auth_client.post(
        URL, {"old_password": password, "new_password": weak_password}, format="json"
    )
    assert response.status_code == 400
    assert "new_password" in response.data
    user.refresh_from_db()
    assert user.check_password(password)


def test_new_password_must_differ_from_current(auth_client, password):
    response = auth_client.post(
        URL, {"old_password": password, "new_password": password}, format="json"
    )
    assert response.status_code == 400
    assert "new_password" in response.data


def test_correct_current_password_changes_password(auth_client, user, password):
    response = auth_client.post(
        URL, {"old_password": password, "new_password": NEW_PASSWORD}, format="json"
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password(NEW_PASSWORD)
    assert not user.check_password(password)
