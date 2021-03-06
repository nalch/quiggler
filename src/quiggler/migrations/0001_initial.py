# Generated by Django 3.0.5 on 2020-05-10 00:36

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Quilt',
            fields=[
                ('slug', models.SlugField(primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(choices=[('square', 'Square'), ('trileft', 'Triangle Left'), ('triright', 'Triangle Right')], default='square', max_length=25)),
                ('width', models.SmallIntegerField(default=25)),
                ('height', models.SmallIntegerField(default=25)),
                ('width_in_cm', models.DecimalField(decimal_places=2, max_digits=12)),
                ('height_in_cm', models.DecimalField(decimal_places=2, max_digits=12)),
                ('json', models.TextField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Fabric',
            fields=[
                ('slug', models.SlugField(primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('image', models.ImageField(upload_to='fabrics/')),
                ('width_in_cm', models.DecimalField(decimal_places=2, max_digits=12)),
                ('height_in_cm', models.DecimalField(decimal_places=2, max_digits=12)),
                ('quilt', models.ManyToManyField(to='quiggler.Quilt')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
