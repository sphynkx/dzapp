from django.db import models
from django.utils import timezone  # для получения текущего времени

class User(models.Model):
    username = models.CharField(max_length=50)

class MsgDb(models.Model):
    title = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, default=None)
    published_date = models.DateField()
    published_time = models.TimeField(default=timezone.now)  # новое поле для времени
    content = models.TextField()
