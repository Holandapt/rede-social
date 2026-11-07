"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import SimpleRouter

from users.views.user_views import MeView
from users.views.register_views import RegisterView
from users.views.change_password_views import ChangePasswordView
from users.views.follow_views import FollowView
from posts.views import PostViewSet

# Este código serve para gerar automaticamente as URLs (endpoints) da tua API para o modelo Post
# Router das postagens: gera /api/posts/ e /api/posts/<id>/
# É uma classe do DRF desenhada para criar automaticamente URLs padrão compatíveis com o padrão REST.
router = SimpleRouter()
# Esta linha regista a PostViewSet
router.register("posts", PostViewSet, basename="post")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", TokenObtainPairView.as_view()),
    path("api/auth/refresh/", TokenRefreshView.as_view()),
    path("api/auth/me/", MeView.as_view()),
    path("api/auth/change-password/", ChangePasswordView.as_view()),
    path("api/users/<int:pk>/follow/", FollowView.as_view(), name="user-follow"),
    path("api/", include(router.urls)),
]

# Add static and media URL patterns for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
