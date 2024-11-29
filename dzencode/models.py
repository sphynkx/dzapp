from django.db import models
from django.utils import timezone

class User(models.Model):
    username = models.CharField(max_length=50)

class MsgDb(models.Model):
    title = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    content = models.TextField()
    published_date = models.DateField(default=timezone.now)
    published_time = models.TimeField(default=timezone.now)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='comments', on_delete=models.CASCADE)
    is_root = models.BooleanField(default=True)
    has_child = models.BooleanField(default=False)
