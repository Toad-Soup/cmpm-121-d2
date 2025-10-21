import "./style.css";

document.body.innerHTML = `
  <canvas id = "canvas"></canvas>
  <h1 style="font-family: Tahoma, sans-serif;">canvas :D </h1>
`;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.height = 256;
canvas.width = 256;

const cursor = { active: false, x: 0, y: 0 };

const lines: { x: number; y: number }[][] = [];
const redoLines: { x: number; y: number }[][] = [];

let currentLine: { x: number; y: number }[] | null = null;

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ x: cursor.x, y: cursor.y });
  redoLines.splice(0, redoLines.length);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    if (currentLine === null) {
      return;
    }
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine.push({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;

  canvas.dispatchEvent(new Event("drawing-changed"));
});

//add the exception function thingy
canvas.addEventListener("drawing-changed", () => {
  redraw();
});

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      ctx.beginPath();
      const { x, y } = line[0];
      ctx.moveTo(x, y);
      for (const { x, y } of line) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

document.body.append(document.createElement("br"));

//the following code is from Professor Smiths Quaint-Paint program
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  const lastLine = lines.pop();
  if (lastLine) {
    redoLines.push(lastLine);
    redraw();
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

//inverse of the undo button
redoButton.addEventListener("click", () => {
  const lastLine = redoLines.pop();
  if (lastLine) {
    lines.push(lastLine);
    redraw();
  }
});
