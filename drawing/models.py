from django.db import models


class Drawing(models.Model):
    coordinates = models.JSONField()
    result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
