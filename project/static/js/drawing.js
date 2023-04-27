const canvas = document.getElementById("drawingCanvas1");
const ctx = canvas.getContext("2d"); //canvas의 컨텍스트?(렌더링될 그리기의 대상)을 얻습니다.
const clearCanvasButton = document.getElementById("clearCanvas");
const selectImageButton = document.getElementById("selectImage");
const drawImageButton = document.getElementById("drawImage");
const deleteButton = document.getElementById("delete");
const viewArrayButton = document.getElementById("viewArray");
const autoDrawButton = document.getElementById("autoDraw");
const pixelRatio = window.devicePixelRatio;

//좌표구성
let canvasLines = [];
let drawnLine = [[], []];
let selectedLines = [];
let selectedLinesIndex = [];
let imageOutLine = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};
//전체 canvasLines 중에서 최소 최대 좌표값
const minmaxInitState = {
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
};
let minmaxState = {
  minX: null,
  minY: null,
  maxX: null,
  maxY: null,
};

//아웃라인 사각형
let outLineRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

//캔버스 디폴트세팅
canvas.width = 1280;
canvas.height = 1024;
canvas.style.width = 1280 + "px";
canvas.style.height = 1024 + "px";
let drawing = false;
let strokeColor = "black";

//selection을 위해 사용될 변수
const overlayCanvas = document.getElementById("drawingCanvas2");
overlayCanvas.width = canvas.width;
overlayCanvas.height = canvas.height;
const overlayCtx = overlayCanvas.getContext("2d");
overlayCtx.setLineDash([5, 5]);
overlayCtx.strokeStyle = "blue";
overlayCtx.lineWidth = 2;
let selectionMode = false;
let selectionRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  isSelecting: false,
};

//두가지의 Mode selection/draw
function selectionModeOn() {
  selectionMode = true;
  canvas.style.cursor = "crosshair";
}

function drawImageModeOn() {
  selectionMode = false;
  canvas.style.cursor = "default";
  selectedLines = [];
  selectedLinesIndex = [];
  console.log("선택된 라인들이 있는가?", selectedLines);
  console.log("선택된 라인의 인덱스가 있는가?", selectedLinesIndex);
}

//selectionMode일때 사용될 함수
function startSelection(e) {
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

function updateSelection(e) {
  if (!selectionRect.isSelecting) return;
  const pos = getMousePos(overlayCanvas, e);
  selectionRect.width = pos.x - selectionRect.x;
  selectionRect.height = pos.y - selectionRect.y;
  drawSelection();
}

function endSelection(e) {
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

  drawOutLine(selectedLines);
  selectionRect.isSelecting = false;
}

function drawSelection() {
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

function findSelectedIndex() {
  const indexList = [];
  canvasLines.map((line, index) => {
    if (selectedLines.includes(line)) {
      indexList.push(index);
    }
  });
  return indexList;
}

//그리기 모드일때 사용될 함수들
function startPosition(e) {
  drawing = true;
  draw(e);
}

function endPosition() {
  drawing = false;
  ctx.beginPath(); // 새로운 경로를 만듬
  canvasLines.push(drawnLine);
  drawnLine = [[], []];
  drawOutLine(canvasLines);
}

function draw(e) {
  if (!drawing) return;
  const pos = getMousePos(canvas, e);
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = strokeColor;
  ctx.lineTo(pos.x, pos.y); //현재 위치에서 지정된 지점까지 선을 그립니다.
  ctx.stroke(); //윤곽선을 이용하여 도형을 그림
  ctx.beginPath(); // 새로운 경로를 만듬
  ctx.moveTo(pos.x, pos.y);
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

//선택한 이미지 삭제후 재생성을 위함
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

//좌표들의 전처리를 위함
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
  const processedLines = relativeCoordinates(canvasLines);
  console.log("좌표: ", processedLines);
  try {
    const response = await fetch("http://127.0.0.1:8000/drawing/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ processedLines }),
    });
    const result = await response.json();
    console.log("Result from Django server:", result);
    processedLines.map((line) => {
      redraw(line);
    });
  } catch (error) {
    console.error("Error :", error);
  }
}

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
