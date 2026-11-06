from rest_framework import serializers

from posts.models import Post


class AuthorSerializer(serializers.Serializer):
    """Dados públicos mínimos do autor de uma postagem."""

    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)

    # O nome é guardado em first_name (igual o UserSerializer)
    name = serializers.CharField(source="first_name", read_only=True)
    avatar = serializers.ImageField(read_only=True)


class PostSerializer(serializers.Serializer):
    # Só leitura: o autor é definido na view a partir do utilizador autenticado
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ["id", "author", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
