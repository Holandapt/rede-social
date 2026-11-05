from django.conf import settings
from django.db import models


class Post(models.Model):

    # Autor da postagem; user.posts devolve todas as suas postagens
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Mais recentes primeiro; o id desempata posts criados no mesmo instante
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.author} - {self.content[:30]}"
