from rest_framework import generics, permissions, status
from rest_framework.response import Response

from users.serializers import ChangePasswordSerializer


# View para a troca de senha do usuário autenticado (POST /api/auth/change-password/).
# Só aceita usuários autenticados e valida a senha atual antes de gravar a nova.
class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    # O método POST é chamado quando o usuário envia a requisição para alterar a senha.
    # Ele instancia o serializer, valida os dados e, se tudo estiver correto, chama o método save() do serializer para atualizar a senha.
    def post(self, request):
        # Cria uma instância do ChangePasswordSerializer, injetando os dados que o cliente enviou no corpo da requisição (request.data)
        # e passando automaticamente o context (incluindo a request e o user) por debaixo dos panos.
        serializer = self.get_serializer(data=request.data)
        # Dispara todas as regras de validação que definimos no serializer;
        # O parâmetro raise_exception=True faz com que, caso haja qualquer erro;
        # o DRF interrompa a execução imediatamente;
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Senha alterada com sucesso."}, status=status.HTTP_200_OK
        )
