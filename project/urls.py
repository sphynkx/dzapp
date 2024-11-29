from django.contrib import admin
from django.urls import path, include
from dzencode.views import index, add_comment

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index),
    path('add_comment/', add_comment, name='add_comment'),
    path('captcha/', include('captcha.urls')),
]
