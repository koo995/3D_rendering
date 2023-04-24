from django.shortcuts import render, redirect
from .forms import DrawingForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from module.TestMain import drawing_predict


@csrf_exempt
def create_drawing(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print("received data: ", data)
        canvas_lines = data.get("preprocessedLines", [])
        print("canvasLine: ", canvas_lines)
        result = drawing_predict(canvas_lines)
        return JsonResponse({"result": result})
    else:
        return render(request, "drawing/create_drawing.html")


# def drawing_predict(lines):
#     return str(7777) + str(lines)
