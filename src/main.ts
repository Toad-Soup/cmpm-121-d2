import "./style.css";

document.body.innerHTML = `
  <canvas id = "canvas"></canvas>
  <h1 style="font-family: Tahoma, sans-serif;">canvas :D </h1>
`;

//create a class to hold all the points
class PointHolder {
  private points: { x: number; y: number }[] = [];

  constructor(startX: number, startY: number) {
    this.points.push({ x: startX, y: startY });
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

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = new PointHolder(cursor.x, cursor.y);
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
