from rest_framework import serializers

from posts.models import Comment

from .post_serializer import AuthorSerializer


class CommentSerializer(serializers.ModelSerializer):
    # Só leitura: o autor e o post vêm da view (token e URL), nunca do corpo do pedido
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author", "content", "created_at"]
        read_only_fields = ["id", "created_at"]
