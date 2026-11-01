from rest_framework import generics, permissions
from users.serializers import RegisterSerializer


# Esta classe representa a view para o registro de novos usuários.
# Ela utiliza o serializer RegisterSerializer para validar e criar novos usuários.
# A view permite que qualquer usuário (mesmo não autenticado) acesse o endpoint de registro,
# permitindo que novos usuários se registrem na aplicação.
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
