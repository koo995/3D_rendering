const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d"); //canvas의 컨텍스트?(렌더링될 그리기의 대상)을 얻습니다.
const strokeWidthControl = document.getElementById("strokeWidth");
const clearCanvasButton = document.getElementById("clearCanvas");
const downloadImageButton = document.getElementById("downloadImage");
const selectImageButton = document.getElementById("selectImage");
const colorSwatches = document.getElementById("colorSwatches");
const pixelRatio = window.devicePixelRatio;

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;
// canvas.width = window.innerWidth * 0.8 * pixelRatio;
// canvas.height = window.innerHeight * 0.8 * pixelRatio;

canvas.style.width = window.innerWidth * 0.8 + "px";
canvas.style.height = window.innerHeight * 0.8 + "px";
ctx.scale(pixelRatio, pixelRatio);

let drawing = false;
let strokeColor = "black";

let selectionMode = false;
let selectionRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  isSelecting: false,
};
//selecttion 관련된 코드
function toggleSelectionMode() {
  selectionMode = !selectionMode;
  canvas.style.cursor = selectionMode ? "crosshair" : "default";
}
function startSelection(e) {
  const pos = getMousePos(canvas, e);
  selectionRect.isSelecting = true;
  selectionRect.x = pos.x;
  selectionRect.y = pos.y;
  selectionRect.width = 0;
  selectionRect.height = 0;
}
function updateSelection(e) {
  if (!selectionRect.isSelecting) return;
  const pos = getMousePos(canvas, e);
  selectionRect.width = pos.x - selectionRect.x;
  selectionRect.height = pos.y - selectionRect.y;
  drawSelection();
}
function endSelection() {
  selectionRect.isSelecting = false;
}
function drawSelection() {
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = canvas.width;
  overlayCanvas.height = canvas.height;
  const overlayCtx = overlayCanvas.getContext("2d");

  overlayCtx.clearRect(0, 0, canvas.width, canvas.height);
  overlayCtx.setLineDash([5, 5]);
  overlayCtx.strokeStyle = "black";
  overlayCtx.lineWidth = 2;
  overlayCtx.strokeRect(
    selectionRect.x,
    selectionRect.y,
    selectionRect.width,
    selectionRect.height
  );

  ctx.drawImage(overlayCanvas, 0, 0);
}

function drawCanvasOutline() {
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);
}

// The function then returns an object with two properties: x and y,
// representing the x and y coordinates of the mouse relative to the top-left corner of the canvas.
function getMousePos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    //
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function startPosition(e) {
  drawing = true;
  draw(e);
}

function endPosition() {
  drawing = false;
  ctx.beginPath(); // 새로운 경로를 만듬
}

function draw(e) {
  if (!drawing) return;
  const pos = getMousePos(canvas, e);
  ctx.lineWidth = strokeWidthControl.value;
  ctx.lineCap = "round";
  ctx.strokeStyle = strokeColor;

  ctx.lineTo(pos.x, pos.y); //현재 위치에서 지정된 지점까지 선을 그립니다.
  ctx.stroke(); //윤곽선을 이용하여 도형을 그림
  ctx.beginPath(); // 새로운 경로를 만듬
  ctx.moveTo(pos.x, pos.y);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCanvasOutline();
}

function downloadImage() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png"); //URL문자열로 반환해 주는 함수다
  link.download = "canvas_drawing.png";
  link.click();
}

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function setColor(event) {
  strokeColor = event.target.style.backgroundColor;
}

function createColorSwatches() {
  for (let i = 0; i < 10; i++) {
    const swatch = document.createElement("button");
    swatch.className = "colorSwatch";
    swatch.style.backgroundColor = randomColor();
    swatch.addEventListener("click", setColor);
    colorSwatches.appendChild(swatch);
  }
}

createColorSwatches();

clearCanvasButton.addEventListener("click", clearCanvas);
downloadImageButton.addEventListener("click", downloadImage);
selectImageButton.addEventListener("click", toggleSelectionMode);
canvas.addEventListener("mousedown", (e) => {
  if (selectionMode) {
    startSelection(e);
  } else {
    startPosition(e);
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (selectionMode) {
    endSelection();
  } else {
    endPosition();
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (selectionMode) {
    updateSelection(e);
  } else {
    draw(e);
  }
});

drawCanvasOutline();

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;
  canvas.style.width = window.innerWidth * 0.8 + "px";
  canvas.style.height = window.innerHeight * 0.8 + "px";
  ctx.scale(pixelRatio, pixelRatio);
  drawCanvasOutline();
}

window.addEventListener("resize", resizeCanvas);
