from django.shortcuts import render, redirect
from .forms import DrawingForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os
from django.http import FileResponse
from module.TestMain import drawing_predict


@csrf_exempt
def create_drawing(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print("received data: ", data)
        canvas_lines = data.get("processedLines", [])
        print("canvasLine: ", canvas_lines)
        result = drawing_predict(canvas_lines)
        return JsonResponse({"result": result})
    else:
        return render(request, "drawing/create_drawing.html")


@csrf_exempt
def create_model(request):
    return render(request, "drawing/3d_model.html")


def serve_fbx(request, filename):
    file_path = os.path.join(settings.BASE_DIR, "module/3d_model", filename)
    return FileResponse(open(file_path, "rb"), content_type="application/octet-stream")


# def drawing_predict(lines):
#     return str(7777) + str(lines)
