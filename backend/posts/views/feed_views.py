from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from posts.models import Post
from posts.serializers.post_serializer import PostSerializer

# O feed devolve os posts dos utilizadores que eu sigo, mais recentes primeiro, paginados.
# A ordenação já vem do Meta do Post (-created_at, -id), por isso não repito.

# Os meus próprios posts não aparecem no feed, porque o requisito é “posts de quem sigo”.


class FeedView(ListAPIView):
    """Feed: posts de quem um utilizador autenticado segue (mais recentes primeiro)."""

    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Posts cujo autor tem um Follow em que o follower é quem faz o pedido.
        # A ordenação (-created_at, -id) vem do Meta do modelo Post

        return Post.objects.filter(
            # Esta é uma consulta relacional em cadeia do Django (field lookups across relationships)
            author__followers_set__follower=self.request.user
            # Otimização de performance.
        ).select_related("author")
