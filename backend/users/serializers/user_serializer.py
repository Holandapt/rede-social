from rest_framework import serializers

from users.models import User

MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2 MB


# Esse serializer é usado para serializar e desserializar os dados do modelo User.
# Ele inclui campos para o nome, avatar e outros atributos do usuário.
# Além disso, ele valida o tamanho do avatar para garantir que não exceda 2 MB.
class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="first_name",
        required=False,
        allow_blank=True,
        max_length=150,
    )
    avatar = serializers.ImageField(required=False, allow_null=True)

    # Contadores de seguidores e de seguidos (só leitura)
    # adiciona um campo calculado e personalizado ao seu serializer, ou seja,
    # um campo que não existe diretamente como um atributo no seu modelo do banco de dados,
    # mas cujo valor você deseja calcular em tempo de execução.
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    # O campo "avatar" é um campo de imagem que permite ao usuário enviar uma imagem de avatar.
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "name",
            "avatar",
            "followers_count",
            "following_count",
        )
        read_only_fields = (
            "id",
            "username",
            "email",
            "followers_count",
            "following_count",
        )

    # A função validate_avatar é um método de validação personalizado que verifica se o tamanho
    # do arquivo de avatar enviado pelo usuário não excede 2 MB.
    def validate_avatar(self, value):
        # Se o valor do avatar for fornecido e o tamanho do arquivo for maior que 2 MB,
        if value and value.size > MAX_AVATAR_SIZE:
            raise serializers.ValidationError("A imagem não pode ter mais de 2 MB.")
        return value

    # Quando declaramos um SerializerMethodField, o DRF espera que criemos um método auxiliar
    # na mesma classe com o padrão de nomenclatura get_<nome_do_campo>.
    def get_followers_count(self, obj):
        # followers_set: os Follow em que este utilizador é o seguido
        return obj.followers_set.count()

    def get_following_count(self, obj):
        # following_set: os Follow em que este utilizador é quem segue
        return obj.following_set.count()
