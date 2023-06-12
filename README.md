# 3D_rendering
<h2>낙서 데이터셋을 이용한 3D모델화 시스템 </h2>
<p>사용자가 임의로 그린 그림을 인식하여 관련된 3D 모델을 웹 페이지에 렌더링하는 콘텐츠를 제안한다. 이를 위해, 자바스크립트와 HTML5 Canvas를 이용하여 낙서와 같이 자유롭게 그림을 그리는 기능을 구현하고, 딥러닝 기반의 미리 학습된 인식 모델을 사용하여 사용자가 그린 그림을 인식후 3D 모델을 보여주는 시스템</P>
<hr>
<h3>dataset은 track 하지않도록 변경</h3>
"git rm -r --cached {파일/폴더명}"으로 Untrack상태로 만들고 .gitignore에 파일/폴더명 추가 후 .gitignore 커밋<br>
하지만 여전히 다른 commit에 dataset은 기록되어 있음. 모든 commit에서 dataset에 대한 커밋을 제거할 필요가 있다.<br>
git filter-branch -f --index-filter "git rm -r --cached --ignore-unmatch ./module/train_simplified_sj" --prune-empty -- --all<br>
