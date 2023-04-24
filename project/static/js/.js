function downsampleLines(canvasLines, n) {
  let sparseCanvasLines = [];

  for (let line of canvasLines) {
    let sparseLine = [];
    for (let i = 0; i < line[0].length; i += n) {
      sparseLine.push([line[0][i], line[1][i]]);
    }
    sparseCanvasLines.push(sparseLine);
  }

  return sparseCanvasLines;
}
