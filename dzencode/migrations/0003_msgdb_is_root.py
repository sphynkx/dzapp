# Generated by Django 5.1.3 on 2024-11-28 10:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dzencode', '0002_msgdb_parent_msgdb_published_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='msgdb',
            name='is_root',
            field=models.BooleanField(default=True),
        ),
    ]
