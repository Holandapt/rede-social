from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from users.models import User


# Essa classe representa o serializer para o registro de novos usuários.
# Ela define os campos que serão incluídos na serialização do registro, incluindo o ID,
# nome de usuário, e-mail e senha. O campo de senha é definido como write_only, o que significa que ele não será retornado na resposta da API.
# O serializer também inclui métodos de validação e criação de usuários, garantindo que a senha seja validada de acordo com as
# regras de validação do Django e que o usuário seja criado corretamente no banco de dados.
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    # Este método é responsável por validar a senha fornecida pelo usuário durante o registro.
    def validate_password(self, value):
        validate_password(value)
        return value

    # Este método é responsável por criar um novo usuário no banco de dados com base nos dados validados fornecidos pelo serializer.
    # Ele utiliza o método create_user do modelo User para criar o usuário, garantindo que a senha seja armazenada de forma segura usando o hash.
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
