from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password

class User(models.Model):
    username = models.CharField(max_length=50)
    author = models.BooleanField(default=False)
    email = models.EmailField(blank=True, null=True)
    homepage = models.URLField(blank=True, null=True)
    password = models.CharField(max_length=128, default=make_password('defaultpassword'))

    class Meta:
        unique_together = ('username', 'email', 'homepage')

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username

class MsgDb(models.Model):
    title = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    content = models.TextField()
    published_date = models.DateField(default=timezone.now)
    published_time = models.TimeField(default=timezone.now)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='comments', on_delete=models.CASCADE)
    is_root = models.BooleanField(default=True)
    has_child = models.BooleanField(default=False)
