from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']



class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_workshop = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']