# Generated by Django 5.1.3 on 2024-12-05 12:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dzencode', '0007_user_email_user_homepage_alter_user_password'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(default='pbkdf2_sha256$870000$VeYWmcnQrrCRXrODQ76QFS$lE7QE9R/6yMaKWkX7Qz48N44ddGAgpecwm//QQHvhkM=', max_length=128),
        ),
        migrations.AlterUniqueTogether(
            name='user',
            unique_together={('username', 'email', 'homepage')},
        ),
    ]
