from django.db import models

class User(models.Model):
    username = models.CharField(max_length=50)

class MsgDb(models.Model):
    title = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, default=None)
    published_date = models.DateField()
    content = models.TextField()
