# Generated by Django 5.1.3 on 2024-12-04 21:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dzencode', '0004_msgdb_has_child_alter_msgdb_published_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='author',
            field=models.BooleanField(default=False),
        ),
    ]
