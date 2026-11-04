# Principio da responsabilidade Única (SRP) - Cada classe deve ter uma única responsabilidade.
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


# Serializer para a troca de senha do usuário autenticado.
# Exige a senha atual (old_password) e valida a nova (new_password) com as mesmas regras do registro.
# Ambos os campos são write_only: nunca são devolvidos na resposta.
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    # Confirma que a senha atual informada é mesmo a do usuário autenticado.
    def validate_old_password(self, value):
        # O DRF injeta automaticamente o dicionário context nos serializers.
        # Nele, costumamos passar o objeto da requisição (request).
        # Isso permite acessar quem é o usuário logado que está fazendo essa requisição de alteração de senha.
        user = self.context["request"].user
        # O Django armazena as senhas de forma criptografada (hash) no banco de dados.
        # O método check_password() pega a string que o usuário digitou (value),
        # aplica o mesmo algoritmo de hash e compara de forma segura com a senha salva no banco.
        if not user.check_password(value):
            raise serializers.ValidationError("Senha atual incorreta.")
        return value

    # Valida a nova senha com os validadores do Django. Ao passar o user, o Django também
    # rejeita senhas parecidas com o username ou o e-mail.
    def validate_new_password(self, value):
        validate_password(value, user=self.context["request"].user)
        return value

    # Validação cruzada: a nova senha não pode ser igual à atual.
    def validate(self, attrs):
        if attrs["old_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "A nova senha não pode ser igual à atual."}
            )
        return attrs

    # Grava a nova senha com hash (set_password) em vez de a guardar em texto simples
    def save(self, **kwargs):
        user = self.context["request"].user
        # Este é um método nativo muito importante do modelo de usuário do Django,
        # Ele pega a nova senha em texto plano (que está segura dentro de self.validated_data)
        # e a converte em um hash criptografado seguro
        user.set_password(self.validated_data["new_password"])
        # Salva as alterações no banco de dados.
        user.save()
        return user
