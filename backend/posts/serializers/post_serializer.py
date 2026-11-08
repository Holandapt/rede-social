from rest_framework import serializers

from posts.models import Post


class AuthorSerializer(serializers.Serializer):
    """Dados públicos mínimos do autor de uma postagem."""

    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)

    # O nome é guardado em first_name (igual o UserSerializer)
    name = serializers.CharField(source="first_name", read_only=True)
    avatar = serializers.ImageField(read_only=True)


class PostSerializer(serializers.ModelSerializer):
    # Só leitura: o autor é definido na view a partir do utilizador autenticado
    author = AuthorSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "content",
            "created_at",
            "updated_at",
            "likes_count",
            "liked_by_me",
            "comments_count",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_likes_count(self, post):
        # Curtidas recebidas pelo post (related_name "likes" no modelo Like)
        return post.likes.count()

    def get_liked_by_me(self, post):
        # O utilizador autenticado vem do contexto que a view passa ao serializer,
        # precisamos do objeto request, que é obtido através do dicionário .context.
        request = self.context.get("request")
        # Se a requisição veio de algum lugar onde o request não foi passado para o serializer
        # (ou se o usuário é um visitante anônimo/não logado), ele retorna False imediatamente
        # em vez de quebrar a aplicação.
        if request is None or not request.user.is_authenticated:
            return False
        # Uma ótima prática de performance no Django, pois ele diz ao banco de dados
        # para retornar apenas um booleano (True/False) de forma super rápida,
        # sem precisar carregar os objetos inteiros para a memória RAM do Python.
        return post.likes.filter(user=request.user).exists()

    def get_comments_count(self, post):
        # Comentários recebidos pelo post (related_name "comments" no modelo Comment)
        return post.comments.count()
