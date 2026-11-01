from rest_framework import serializers
from users.models import User


# Essa classe representa o serializer para o modelo de usuário personalizado.
# Ela define os campos que serão incluídos na serialização do usuário, incluindo o ID,
# nome de usuário, e-mail, primeiro nome e avatar. O serializer é usado para converter
# os dados do modelo em formatos como JSON, facilitando a comunicação entre o backend e o frontend da aplicação.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "avatar"]
