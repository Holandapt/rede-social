from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from users.serializers import UserSerializer


# Esta classe representa a view para obter informações sobre o usuário atualmente autenticado.
# Ela utiliza o serializer UserSerializer para serializar os dados do usuário.
# A view retorna os dados do usuário autenticado, permitindo que ele visualize suas próprias informações.
class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [
        IsAuthenticated
    ]  # Permite acesso apenas a usuários autenticados
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]  # Permite o envio de dados em formato multipart/form-data
    http_method_names = [
        "get",
        "patch",
        "head",
        "options",
    ]  # Permite apenas os métodos GET, PATCH, HEAD e OPTIONS

    def get_object(self):
        return self.request.user
