from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from posts.models import Like, Post


class LikeView(APIView):
    """Curte (POST) ou descurte (DELETE) a postagem indicada no URL."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        # get_or_create torna o pedido idempotente (201 se criou, 200 se já curtia)
        _, criado = Like.objects.get_or_create(user=request.user, post=post)
        # Define o status HTTP correto dependendo se o Like é novo ou antigo
        codigo = status.HTTP_201_CREATED if criado else status.HTTP_200_OK
        # Retorna a resposta JSON atualizada do post
        return Response(self._estado(post, True), status=codigo)

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        Like.objects.filter(user=request.user, post=post).delete()
        return Response(self._estado(post, False), status=status.HTTP_200_OK)

    # Significa que este método auxiliar não precisa do self (a instância da View) para funcionar.
    #  Ele é apenas uma função utilitária pura guardada dentro da classe para organizar o código.
    @staticmethod
    def _estado(post, liked_by_me):
        # Estado atualizado que o front usa para refrescar o botão e a contagem
        return {"liked_by_me": liked_by_me, "likes_count": post.likes.count()}
