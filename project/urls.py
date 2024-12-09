from django.contrib import admin
from django.urls import path, include
from dzencode.views import index, add_comment, add_post, get_post_by_id

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='index'),
    path('add_comment/', add_comment, name='add_comment'),
    path('captcha/', include('captcha.urls')),
    path('add_post/', add_post, name='add_post'),
    path('api/posts/<int:post_id>/', get_post_by_id, name='get_post_by_id'),
]
