from django.conf import settings
from django.db import models


# Trata-se de uma relação de muitos-para-muitos (Many-to-Many) auto-referencial
# (ambas as pontas apontam para o modelo de utilizador), mas implementada através de uma tabela
# intermédia explícita para conseguirmos guardar dados adicionais (como a data em que o seguimento
#  começou) e aplicar restrições de integridade.
class Follow(models.Model):
    """Relação 'follower segue following'."""

    # Quem segue; user.following_set devolve quem ele segue
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="following_set",
    )
    # Quem é seguido; user.followers_set devolve os seus seguidores
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="followers_set",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # Não se pode seguir a mesma pessoa duas vezes
            models.UniqueConstraint(
                fields=["follower", "following"], name="unique_follow"
            ),
            # Não se pode seguir a si próprio
            # O objeto models.F() é uma ferramenta poderosa do Django que permite
            # comparar valores de colunas diferentes na mesma linha da base de dados
            # models.Q(...) é usado para construir expressões de consulta
            # O símbolo ~ antes do models.Q representa um operador NOT (negação) em Django.
            models.CheckConstraint(
                condition=~models.Q(follower=models.F("following")),
                name="no_self_follow",
            ),
        ]

    def __str__(self):
        return f"{self.follower} -> {self.following}"
