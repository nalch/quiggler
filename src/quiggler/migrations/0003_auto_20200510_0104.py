# Generated by Django 3.0.5 on 2020-05-10 01:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiggler', '0002_auto_20200510_0052'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fabric',
            name='slug',
            field=models.SlugField(editable=False, primary_key=True, serialize=False, unique=True),
        ),
        migrations.AlterField(
            model_name='quilt',
            name='slug',
            field=models.SlugField(editable=False, primary_key=True, serialize=False, unique=True),
        ),
    ]
