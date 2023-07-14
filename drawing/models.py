from django.db import models


class Drawing(models.Model):
    coordinates = models.JSONField()  # json 포맷 형식의 데이터를 담기 위함
    result = models.CharField(max_length=30)  # 벡터로 표현된 그림의 예측값
    created_at = models.DateTimeField(auto_now_add=True)  # 객체의 생성날짜
