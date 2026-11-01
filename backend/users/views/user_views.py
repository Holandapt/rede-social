from rest_framework import generics
from users.serializers import UserSerializer


# Esta classe representa a view para obter informações sobre o usuário atualmente autenticado.
# Ela utiliza o serializer UserSerializer para serializar os dados do usuário.
# A view retorna os dados do usuário autenticado, permitindo que ele visualize suas próprias informações.
class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
