from django.db import models


class Drawing(models.Model):
    coordinates = models.JSONField()
    result = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
