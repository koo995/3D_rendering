from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.template.loader import render_to_string
import json
import os
from django.http import FileResponse
from django.template import RequestContext
from module.TestMain import drawing_predict


@csrf_exempt
def create_drawing(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print("received data: ", data)
        canvas_lines = data.get("processedLines", [])
        print("canvasLine: ", canvas_lines)
        # 카테고리명을 얻음
        result = drawing_predict(canvas_lines)
        # 얻은 카테고리명을 기반으로 3d모델을 나타낼 html파일을 생성
        new_html_content = render_to_string(
            "drawing/3d_model.html", {"category": result}
        )
        return JsonResponse({"new_html_content": new_html_content})
    else:
        return render(request, "drawing/create_drawing.html")


# 3d_model.html에서 FBXLoader가 해당 카테고리의 fbx파일을 요청하면 전달
def serve_fbx(request, filename):
    file_path = os.path.join(settings.BASE_DIR, "module/3d_model", filename)
    return FileResponse(open(file_path, "rb"), content_type="application/octet-stream")


# root url로 들어왔을때 drawing/create 로 redirect 하기 위함
def redirect_view(request):
    response = redirect("drawing:create_drawing")
    return response
