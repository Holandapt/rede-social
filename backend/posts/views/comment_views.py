from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from posts.models import Comment, Post
from posts.serializers.comment_serializer import CommentSerializer


class CommentListCreateView(ListCreateAPIView):
    """Lista (GET, paginada) e cria (POST) comentários da postagem indicada no URL."""

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_post(self):
        # 404 se a postagem não existir, tanto ao listar como ao comentar
        return get_object_or_404(Post, pk=self.kwargs["pk"])

    # Permite que a view decida quais dados buscar com base na URL da requisição
    def get_queryset(self):
        # A ordenação (mais antigos primeiro) vem do Meta do modelo Comment
        return Comment.objects.filter(post=self.get_post()).select_related("author")

    # gancho (hook) nativo das Views Genéricas do Django REST Framework (DRF) especificamente
    # daquelas que lidam com a criação de recursos, como CreateAPIView ou ListCreateAPIView.
    def perform_create(self, serializer):
        # Autor e post nunca vêm do corpo do pedido
        serializer.save(author=self.request.user, post=self.get_post())


# Segurança e Integridade: Se permitíssemos que o cliente enviasse quem é o autor ou a qual post
# o comentário pertence diretamente no corpo JSON da requisição (request.data),
# um usuário mal-intencionado poderia manipular o JSON e enviar o ID de outro usuário fingindo ser
# ele, ou associar o comentário a um post proibido.

# Por isso, a API protege essa regra: o autor tem de ser obrigatoriamente o utilizador autenticados
# atual (self.request.user), e o post tem de ser o post extraído da URL atual (self.get_post()).


# Quando o cliente envia uma requisição POST com os dados do comentário (por exemplo,
# { "content": "Excelente post!" }), o DRF valida os dados através do serializer. Logo em seguida,
# em vez de chamar apenas serializer.save(), a view chama o perform_create(self, serializer).

# É aqui que você completa o que faltava no dicionário de dados injetando os argumentos extras
#  (author=self.request.user, post=self.get_post()). O serializer.save() pega esses dados
# misturados (o conteúdo que veio do JSON + o autor e o post injetados pela view) e finalmente
# executa o .create() no modelo do Django, gravando tudo de forma segura e correta no banco de dados.
