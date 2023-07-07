from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.template.loader import render_to_string
import json
import os
import csv
from django.http import FileResponse
from module.TestMain import drawing_predict
from .models import Drawing


@csrf_exempt
def create_drawing(request):
    if request.method == "POST":
        data = json.loads(request.body)
        canvas_lines = data.get("processedLines", [])
        result = drawing_predict(canvas_lines)  # 카테고리명을 얻음
        # 데이터베이스에 저장
        drawing = Drawing(
            coordinates=canvas_lines, result=result
        )  # models.py 안에 있는 Drawing 클래스를 초기화
        drawing.save()
        # csv파일에 결과 저장
        csv_file = os.path.join(settings.BASE_DIR, "drawings.csv")
        with open(csv_file, mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(
                [json.dumps(canvas_lines), json.dumps(result), drawing.created_at]
            )

        # 얻은 카테고리명을 기반으로 3d모델을 나타낼 html파일로 결과 전달
        return JsonResponse({"category": result})
    else:
        return render(request, "drawing/create_drawing.html")


# 3d_model.html에서 FBXLoader가 해당 카테고리의 fbx파일의 url을 요청하면 실행
def serve_fbx(request, filename):
    file_path = os.path.join(settings.BASE_DIR, "module/3d_model", filename)
    return FileResponse(open(file_path, "rb"), content_type="application/octet-stream")


# root url로 들어왔을때 drawing/create 로 redirect 하기 위함
def redirect_view(request):
    return redirect("drawing:create_drawing")
