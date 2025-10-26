import "./style.css";

document.body.innerHTML = `
  <canvas id = "canvas"></canvas>
  <h1 style="font-family: Tahoma, sans-serif;">canvas :D </h1>
`;

//create a class to hold all the points
class PointHolder {
  private points: { x: number; y: number }[] = [];
  private thickness: number;

  constructor(startX: number, startY: number, thickness: number) {
    this.points.push({ x: startX, y: startY });
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.beginPath();
    const { x, y } = this.points[0];
    ctx.moveTo(x, y);

    for (const p of this.points) {
      ctx.lineTo(p.x, p.y);
    }

    ctx.lineWidth = this.thickness;
    ctx.stroke();
  }
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.height = 256;
canvas.width = 256;

const cursor = { active: false, x: 0, y: 0 };

const lines: PointHolder[] = [];
const redoLines: PointHolder[] = [];

let currentLine: PointHolder | null = null;

let currentSize = 2;

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = new PointHolder(cursor.x, cursor.y, currentSize);
  lines.push(currentLine);
  redoLines.length = 0;

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    if (currentLine === null) {
      return;
    }
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new Event("drawing-changed"));

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
    line.display(ctx);
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

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.length = 0;
  redraw();
});

const thinButton = document.createElement("button");
thinButton.innerHTML = "thin line";
document.body.append(thinButton);
thinButton.addEventListener("click", () => {
  currentSize = 2;
  setSelectedTool(thinButton);
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick line";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  currentSize = 5;
  setSelectedTool(thickButton);
});

function setSelectedTool(selected: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((btn) =>
    btn.classList.remove("selectedTool")
  );
  selected.classList.add("selectedTool");
}
