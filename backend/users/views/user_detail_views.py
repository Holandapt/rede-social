from django.contrib.auth import get_user_model
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from users.serializers import PublicUserSerializer

User = get_user_model()

# Cria um endpoint de API que exibe o perfil público de um utilizador específico.


# RetrieveAPIView é uma Generic View (visão genérica) utilizada especificamente para
# recuperar e exibir os detalhes de uma única instância (um único registo) de um modelo
# através de um pedido HTTP GET
class UserDetailView(RetrieveAPIView):
    """Perfil público de um utilizador, com contadores e is_following."""

    serializer_class = PublicUserSerializer
    permission_classes = [IsAuthenticated]
    # Define o conjunto total de utilizadores da base de dados.
    # Quando a rota receber um ID na URL, a view vai usar este queryset para procurar o utilizador.
    queryset = User.objects.all()
