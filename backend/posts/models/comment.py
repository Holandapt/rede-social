from django.conf import settings
from django.db import models


class Comment(models.Model):
    """Comentário de um utilizador numa postagem."""

    # Post comentado: post.comments são os comentários recebidos pelo post
    post = models.ForeignKey(
        "posts.Post",
        on_delete=models.CASCADE,
        related_name="comments",
    )

    # Autor: user.comments são os comentários escritos por esse utilizador
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Do mais antigo para o mais recente, como numa conversa
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"Comentário {self.pk} de {self.author} no post {self.post_id}"
