from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import Follow

# Obtém dinamicamente o modelo de utilizador ativo configurado no projeto
User = get_user_model()


class FollowView(APIView):
    """Segue (POST) ou deixa de seguir (DELETE) o utilizador indicado no URL."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Procura na base de dados o utilizador cujo ID (pk) veio indicado no URL
        alvo = get_object_or_404(User, pk)

        if alvo == request.user:
            return Response(
                {"detail": "Nao pode seguir-te a ti proprio"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # get_or_create torna o pedido idempotente (200 se já seguia, 201 se criou)
        _, criado = Follow.objects.get_or_create(follower=request.user, following=alvo)
        codigo = status.HTTP_201_CREATED if criado else status.HTTP_200_OK
        return Response({"following": True}, status=codigo)

    def delete(self, request, pk):
        alvo = get_object_or_404(User, pk=pk)
        Follow.objects.filter(follower=request.user, following=alvo).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
