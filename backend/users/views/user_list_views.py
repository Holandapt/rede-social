from django.contrib.auth import get_user_model
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from users.serializers import PublicUserSerializer

User = get_user_model()


class UserListView(ListAPIView):
    """Lista paginada de utilizadores (para descobrir a quem seguir)."""

    serializer_class = PublicUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Exclui o próprio utilizador; ordena por username para a paginação ser estável
        return User.objects.exclude(pk=self.request.user.pk).order_by("username")
