from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from users.serializers import PublicUserSerializer

User = get_user_model()


class FollowersListView(ListAPIView):
    """Lista paginada de quem segue o utilizador indicado no URL."""

    serializer_class = PublicUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        alvo = get_object_or_404(User, pk=self.kwargs["pk"])
        # Utilizadores que têm um Follow com following=alvo
        return User.objects.filter(following_set__following=alvo).order_by("username")


class FollowingListView(ListAPIView):
    """Lista paginada de quem o utilizador indicado no URL segue."""

    serializer_class = PublicUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        alvo = get_object_or_404(User, pk=self.kwargs["pk"])
        # Utilizadores que têm um Follow com follower=alvo
        return User.objects.filter(followers_set__follower=alvo).order_by("username")
