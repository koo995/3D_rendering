from django.db import models


class Drawing(models.Model):
    # title = models.CharField(max_length=255)
    coordinates = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
