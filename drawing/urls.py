from django.urls import path, include
from . import views

app_name = "drawing"

urlpatterns = [
    path("create/", views.create_drawing, name="create_drawing"),
    path("fbx/<str:filename>", views.serve_fbx, name="serve_fbx"),
]
