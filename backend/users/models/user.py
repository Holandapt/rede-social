from django.contrib.auth.models import AbstractUser
from django.db import models


#  Essa classe representa o modelo de usuário personalizado, estendendo o modelo AbstractUser do Django.
#  Ela adiciona um campo adicional chamado "avatar", que é uma imagem que pode ser associada ao usuário.
#  O campo avatar permite que os usuários façam upload de uma imagem de perfil,
#  armazenando-a no diretório "avatars/". O campo é opcional, permitindo valores nulos e em branco.
class User(AbstractUser):
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
