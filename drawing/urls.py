from django.urls import path, include
from . import views

app_name = "drawing"

urlpatterns = [
    path("create/", views.create_drawing, name="create_drawing"),
    path("3d/", views.create_model, name="create_3d"),
    path("fbx/<str:filename>", views.serve_fbx, name="serve_fbx"),  # Add this line
]
