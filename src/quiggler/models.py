from boltons.strutils import slugify
from django.db import models

from quiggler.constants import QUILT_TYPES, QUILT_TYPES_DEFAULT


class SlugModel(models.Model):
    slug = models.SlugField(primary_key=True, unique=True, editable=False)
    name = models.CharField(max_length=255)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, "-")
        super().save(*args, **kwargs)


class Fabric(SlugModel):
    image = models.ImageField(upload_to="fabrics/")
    width_in_cm = models.DecimalField(decimal_places=2, max_digits=12)
    height_in_cm = models.DecimalField(decimal_places=2, max_digits=12)

    quilt = models.ManyToManyField("quiggler.Quilt", related_name="fabrics", blank=True, default=[])


class Quilt(SlugModel):
    type = models.CharField(
        choices=QUILT_TYPES,
        default=QUILT_TYPES_DEFAULT,
        max_length=25
    )

    width = models.SmallIntegerField(default=25)
    height = models.SmallIntegerField(default=25)

    width_in_cm = models.DecimalField(decimal_places=2, max_digits=12)
    height_in_cm = models.DecimalField(decimal_places=2, max_digits=12)

    public = models.BooleanField(default=False)

    json = models.TextField(blank=True, null=True)

    # todo krsc: nodes, links, faces
