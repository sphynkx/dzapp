from django.db import models
from django.utils import timezone

class User(models.Model):
    username = models.CharField(max_length=50)

class MsgDb(models.Model):
    title = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, default=None)
    published_date = models.DateField()
    published_time = models.TimeField(default=timezone.now)
    content = models.TextField()
    is_root = models.BooleanField(default=True)  ## separete posts as root or their comments
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
