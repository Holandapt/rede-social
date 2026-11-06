from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from posts.models import Post
from posts.permissions import IsAuthorOrReadOnly
from posts.serializers import PostSerializer


# o .ModelViewSet ja traz todas as operacoes CRUD
class PostViewSet(viewsets.ModelViewSet):
    """CRUD de postagens: autenticados leem e criam, só o autor edita e apaga."""

    # select_related evita uma query extra por postagem para ir buscar o autor
    # O select_related("author") é uma otimização de performance essencial.
    # Como cada post tem um autor (que é um utilizador), sem isso o Django faria uma consulta
    # separada ao banco de dados para cada post na listagem para buscar os dados do autor
    # (o famoso problema do N+1 queries). Com o select_related, ele faz um JOIN no SQL e traz
    # tudo de uma só vez.
    queryset = Post.objects.select_related("author")
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]

    # O perform_create age como segurança: ele intercepta o salvamento do serializer e
    # injeta manualmente o utilizador autenticado (self.request.user, obtido através do token
    # de acesso) como o do autor oficial do post.
    def perform_create(self, serializer):
        # O autor vem sempre do token, nunca do corpo do pedido
        serializer.save(author=self.request.user)
