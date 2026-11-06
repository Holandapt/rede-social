from rest_framework.permissions import SAFE_METHODS, BasePermission

# Este código define uma permissão personalizada (Custom Permission) para o Django REST Framework
# O objetivo dela é implementar uma regra de segurança muito comum em APIs: qualquer utilizador
# pode ler (ver) os dados, mas apenas o autor do conteúdo pode editá-lo ou apagá-lo.


class IsAuthorOrReadOnly(BasePermission):
    """Leitura para qualquer utilizador autenticado; escrita só para o autor."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user
