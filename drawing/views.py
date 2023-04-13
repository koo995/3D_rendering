from django.shortcuts import render, redirect
from .forms import DrawingForm
import json


def create_drawing(request):
    if request.method == "POST":
        coordinates = json.loads(request.POST["coordinates"])
        form = DrawingForm({"coordinates": coordinates})
        if form.is_valid():
            form.save()
            return redirect("/")
    else:
        # form = DrawingForm()
        return render(request, "drawing/create_drawing.html")
