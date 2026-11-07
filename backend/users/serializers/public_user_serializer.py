from rest_framework import serializers

from users.models import Follow
from users.serializers.user_serializer import UserSerializer


# Dados públicos de um utilizador: herda o name/avatar e os contadores do UserSerializer,
# mas com uma lista de campos fixa SEM email, e acrescenta se quem pede já segue este utilizador.
class PublicUserSerializer(UserSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = (
            "id",
            "username",
            "name",
            "avatar",
            "followers_count",
            "following_count",
            "is_following",
        )
        read_only_fields = fields

    def get_is_following(self, obj):
        request = self.context.get("request")
        # Verifica se existe uma requisição válida e se o utilizador está autenticado (tem sessão iniciada).
        if request is None or not request.user.is_authenticated:
            return False
        # Se o utilizador estiver autenticado, o Django vai à base de dados verificar se existe um registo na tabela Follow
        # Follower (quem segue) é o utilizador atual (request.user).
        # following (quem é seguido) é o objeto atual que está a ser serializado
        # (obj, por exemplo, o perfil de outro utilizador).
        return Follow.objects.filter(follower=request.user, following=obj).exists()
