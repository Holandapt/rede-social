from django.conf import settings
from django.db import models


class Like(models.Model):
    """Curtida de um utilizador num post (no máximo uma por par utilizador/post)."""

    # Quem curtiu: user.likes são as curtidas feitas por esse utilizador
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes"
    )
    # Post curtido: post.likes são as curtidas recebidas pelo post
    post = models.ForeignKey(
        "posts.Post", on_delete=models.CASCADE, related_name="Likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "post"], name="unique_like"),
        ]

    def __str__(self):
        return f"{self.user} curtiu o post {self.post_id}"
