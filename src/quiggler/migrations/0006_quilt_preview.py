# Generated by Django 3.0.5 on 2020-08-03 20:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiggler', '0005_quilt_public'),
    ]

    operations = [
        migrations.AddField(
            model_name='quilt',
            name='preview',
            field=models.ImageField(blank=True, default=None, null=True, upload_to='fabrics/'),
        ),
    ]
