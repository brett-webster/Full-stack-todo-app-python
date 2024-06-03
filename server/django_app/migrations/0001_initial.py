# Generated by Django 5.0.6 on 2024-05-26 21:44

# pylint: disable=invalid-name
# pylint: disable=line-too-long
"""docstring for auto-generated module"""
from django.db import migrations, models


class Migration(migrations.Migration):
    """docstring for auto-generated class"""

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Todos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sorted_rank', models.IntegerField()),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('task', models.CharField()),
                ('status_complete', models.BooleanField()),
            ],
            options={
                'db_table': 'todos',
            },
        ),
    ]
