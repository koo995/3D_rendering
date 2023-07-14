import { updateModel } from "./three.js"; // 끝에 .js 붙여줘야함

const canvas = document.getElementById("drawingCanvas1"); //메인 그림은 canvas1에 그려준다
const overlayCanvas = document.getElementById("drawingCanvas2"); // canvas2에 그려준다.
const ctx = canvas.getContext("2d");
const clearCanvasButton = document.getElementById("clearCanvas");
const selectImageButton = document.getElementById("selectImage");
const drawImageButton = document.getElementById("drawImage");
const deleteButton = document.getElementById("delete");
const viewArrayButton = document.getElementById("viewArray");
const autoDrawButton = document.getElementById("autoDraw");

//좌표구성
let canvasLines = []; // 현재 캔버스에 있는 모든 선들의 벡터
let drawnLine = [[], []]; // 현 시점 그려지는 중인 선 x, y 벡터값이 마우스 움직임에따라 담겨짐
let selectedLines = []; // 선택된 선들의 벡터
let selectedLinesIndex = []; // 선택된 선들의 캔버스 전체에서 index값

//전체 canvasLines 중에서 최소 최대 좌표값의 초기값의 설정의 위함
const minmaxInitState = {
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
};
// 전체 canvasLines 중에서 최소 최대 좌표값
let minmaxState = {
  minX: null,
  minY: null,
  maxX: null,
  maxY: null,
};

// 전체 그림의 아웃라인 사각형
let outLineRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

//디폴트세팅
let drawing = false; // 마우스 클릭 전까지는 아무것도 그려지면 안된다.
let strokeColor = "black";

//selection을 위해 사용될 변수
const overlayCtx = overlayCanvas.getContext("2d");
overlayCtx.setLineDash([5, 5]); // 선택영역은 점선으로
overlayCtx.strokeStyle = "blue";
overlayCtx.lineWidth = 2;
let selectionMode = false; // 버튼 클릭 전까지 default는 false
let selectionRect = {
  // 선택된 선들의 아웃라인 사각형
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  isSelecting: false,
};

// selectionModeon true 이면 selection모드, false면 그리기 모드
function selectionModeOn() {
  selectionMode = true;
  canvas.style.cursor = "crosshair";
}

function drawImageModeOn() {
  selectionMode = false; // selectionModeon true 이면 selection모드, false면 그리기 모드
  canvas.style.cursor = "default";
  // 선택된 선들과 index 를 담는 변수를 초기화한다.
  selectedLines = [];
  selectedLinesIndex = [];
  console.log("선택된 라인들이 있는가?", selectedLines);
  console.log("선택된 라인의 인덱스가 있는가?", selectedLinesIndex);
}

//selectionMode일때 사용될 함수
function startSelection(e) {
  // selection 모드일때 mouse down event객체를 받는 콜백함수
  //selection사각형을 다시 초기화해줌
  selectionRect.x = 0;
  selectionRect.y = 0;
  selectionRect.width = 0;
  selectionRect.height = 0;
  //현재위치(사각형의 시작점) 지정
  const pos = getMousePos(overlayCanvas, e);
  selectionRect.isSelecting = true;
  selectionRect.x = pos.x;
  selectionRect.y = pos.y;
  selectionRect.width = 0;
  selectionRect.height = 0;
}
// selection 모드일때 마우스 움직임 event객체를 받는 콜백함수
function updateSelection(e) {
  if (!selectionRect.isSelecting) return;
  const pos = getMousePos(overlayCanvas, e);
  selectionRect.width = pos.x - selectionRect.x;
  selectionRect.height = pos.y - selectionRect.y;
  drawSelection();
}

function endSelection(e) {
  //selection 모드일때 mouse up event객체를 받는 콜백함수
  const pos = getMousePos(overlayCanvas, e);
  //마우스가 시작점보다 왼쪽이나 위쪽에서 끝났을 경우 처리
  if (pos.x < selectionRect.x) {
    selectionRect.x = pos.x;
    selectionRect.width = Math.abs(selectionRect.width);
  }
  if (pos.y < selectionRect.y) {
    selectionRect.y = pos.y;
    selectionRect.height = Math.abs(selectionRect.height);
  }

  console.log("selectionRect: ", selectionRect);
  selectedLines = getSelectedLines();
  selectedLinesIndex = findSelectedIndex();
  console.log("Selected lines: ", selectedLines);
  console.log("Selected line indexes of canvasLines: ", selectedLinesIndex);
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  drawOutLine(selectedLines); // 선택된 선들로 아웃라인 그려준다.
  selectionRect.isSelecting = false; //selecting이 끝나서 false
}

// selection 영역을 그림
function drawSelection() {
  // 마우스 움직임에 따라 매번 새롭게  크기가 변화하는 사각형을 그려준다
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.beginPath();
  overlayCtx.strokeRect(
    selectionRect.x,
    selectionRect.y,
    selectionRect.width,
    selectionRect.height
  );
  overlayCtx.drawImage(overlayCanvas, 0, 0);
}

// 현재 캔버스상에 그려진 모든 획들(canvasLines)중에서 selectionRect영역 안에 있는 획들을 찾아서 반환
function getSelectedLines() {
  const selectedLines = [];
  for (const line of canvasLines) {
    for (let i = 0; i < line[0].length; i++) {
      const x = line[0][i];
      const y = line[1][i];
      if (
        x >= selectionRect.x &&
        x <= selectionRect.x + selectionRect.width &&
        y >= selectionRect.y &&
        y <= selectionRect.y + selectionRect.height
      ) {
        selectedLines.push(line);
        break;
      }
    }
  }
  return selectedLines;
}

// 선택된 선들의 전체 그림에서의 index값을 찾음.
// 선택된 선들을 삭제할시 전체 그림에서 선택된 index만 제거하기위함
function findSelectedIndex() {
  const indexList = [];
  canvasLines.map((line, index) => {
    if (selectedLines.includes(line)) {
      indexList.push(index);
    }
  });
  return indexList;
}

//그리기 모드일때 마우스 down 콜백함수
function startPosition(e) {
  drawing = true;
  draw(e);
}

function endPosition(e) {
  //그리기 모드일때 마우스 up 콜백함수
  drawing = false;
  ctx.beginPath(); // 새로운 경로를 만듬
  canvasLines.push(drawnLine); // 새롭게 그려진 라인을 전체 라인에 넣어줌
  drawnLine = [[], []]; // 값을 넣어준 후 빈벡터로 초기화
  drawOutLine(canvasLines);
}

function draw(e) {
  //그리기 모드일때 마우스 움직임에따라 선을 그리는 콜백함수
  if (!drawing) return;
  const pos = getMousePos(canvas, e);
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = strokeColor;
  ctx.lineTo(pos.x, pos.y); //출발위치에서 도착점 지정
  ctx.stroke(); // 출발지점에서 도착점까지 선을 그림
  ctx.beginPath(); // 새로운 경로를 만듬
  ctx.moveTo(pos.x, pos.y); // 선의 출발점 지정
  drawnLine[0].push(pos.x);
  drawnLine[1].push(pos.y);
}

function getMousePos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// 매개변수로 받은 라인들중에서 최대 최소좌표값 반환
function getMinMaxCoord(lines) {
  let { minX, minY, maxX, maxY } = minmaxInitState;
  for (const line of lines) {
    for (let i = 0; i < line[0].length; i++) {
      const x = line[0][i];
      const y = line[1][i];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY };
}

// 매개변수로 전달받은 라인들의 아웃라인을 그려줌
function drawOutLine(lines) {
  const { minX, minY, maxX, maxY } = getMinMaxCoord(lines);
  if (!selectionMode) {
    minmaxState = { minX, minY, maxX, maxY };
  }
  console.log("minmaxState: ", minmaxState);
  outLineRect = {
    ...outLineRect,
    x: minX - 10,
    y: minY - 10,
    width: maxX - minX + 20,
    height: maxY - minY + 20,
  };
  console.log("outLineRect", outLineRect);
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.beginPath();
  overlayCtx.strokeRect(
    outLineRect.x,
    outLineRect.y,
    outLineRect.width,
    outLineRect.height
  );
  overlayCtx.drawImage(overlayCanvas, 0, 0);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  canvasLines = [];
  minmaxState = {
    ...minmaxInitState,
  };
  console.log("클리어 한 후 canvasLines: ", canvasLines);
}

function viewImageCoord() {
  console.log("canvasLines: ", canvasLines);
  console.log("drawnLine: ", drawnLine);
}

//선택한 이미지 삭제후 redraw을 위함
function deleteDrawing() {
  const canvasLinesTemp = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  canvasLines.map((line, index) => {
    if (!selectedLinesIndex.includes(index)) {
      redraw(line);
      canvasLinesTemp.push(line);
    }
  });
  canvasLines = canvasLinesTemp;
  selectedLinesIndex = [];
}

function redraw(line) {
  for (let i = 0; i < line[0].length; i++) {
    const x = line[0][i];
    const y = line[1][i];
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  ctx.beginPath();
}

//좌표들의 표준화를 위함 (0-255범위 + 4개의 좌표마다 하나씩 샘플링)
function relativeCoordinates(lines) {
  const { minX, minY, maxX, maxY } = minmaxState;
  let tempLines = [];
  let tempLine = [[], []];
  let drawLengthX = maxX - minX;
  let drawLengthY = maxY - minY;
  for (const line of lines) {
    for (let i = 0; i < line[0].length; i += 4) {
      const x = Math.round(((line[0][i] - minX) / drawLengthX) * 255);
      const y = Math.round(((line[1][i] - minY) / drawLengthY) * 255);
      tempLine[0].push(x);
      tempLine[1].push(y);
    }
    tempLines.push(tempLine);
    tempLine = [[], []];
  }
  return tempLines;
}

async function autoDraw() {
  const processedLines = relativeCoordinates(canvasLines); // 벡터값들을 표준화함
  console.log("좌표: ", processedLines);
  try {
    const response = await fetch("http://127.0.0.1:8000/drawing/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ processedLines }),
    });
    if (response.ok) {
      const data = await response.json(); // 벡터값에 대한 예측 결과를 받음
      document.getElementById("category").innerHTML = data.category;
      updateModel();
    } else {
      console.error("Failed to fetch the data");
    }
  } catch (error) {
    console.error("Error :", error);
  }
}

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  overlayCanvas.width = overlayCanvas.offsetWidth;
  overlayCanvas.height = overlayCanvas.offsetHeight;
  overlayCtx.setLineDash([5, 5]); // 선택영역은 점선으로
  overlayCtx.strokeStyle = "blue";
  overlayCtx.lineWidth = 2;
}

window.addEventListener("resize", resizeCanvas);
clearCanvasButton.addEventListener("click", clearCanvas);
selectImageButton.addEventListener("click", selectionModeOn);
drawImageButton.addEventListener("click", drawImageModeOn);
deleteButton.addEventListener("click", deleteDrawing);
viewArrayButton.addEventListener("click", viewImageCoord);
autoDrawButton.addEventListener("click", autoDraw);
canvas.addEventListener("mousedown", (e) => {
  if (selectionMode) {
    startSelection(e);
  } else {
    startPosition(e);
  }
});
canvas.addEventListener("mouseup", (e) => {
  if (selectionMode) {
    endSelection(e);
  } else {
    endPosition(e);
  }
});
canvas.addEventListener("mousemove", (e) => {
  if (selectionMode) {
    updateSelection(e);
  } else {
    draw(e);
  }
});
