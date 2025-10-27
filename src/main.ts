import "./style.css";

document.body.innerHTML = `
  <canvas id = "canvas"></canvas>
  <h1 style="font-family: Tahoma, sans-serif;">canvas :D </h1>
`;

//create a class to hold all the points
class PointHolder {
  points: { x: number; y: number }[] = [];
  thickness: number;

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

class ToolPreview {
  private x: number;
  private y: number;
  private thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  updateThickness(thickness: number) {
    this.thickness = thickness;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.fill();
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
let currentPreview: ToolPreview | null = new ToolPreview(0, 0, 2);

let currentSize = 4;

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  currentPreview = null;

  currentLine = new PointHolder(cursor.x, cursor.y, currentSize);
  lines.push(currentLine);
  redoLines.length = 0;

  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  if (cursor.active && currentLine) {
    currentLine.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    if (!currentPreview) {
      currentPreview = new ToolPreview(cursor.x, cursor.y, currentSize);
    } else {
      currentPreview.updatePosition(cursor.x, cursor.y);
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
  currentPreview = new ToolPreview(cursor.x, cursor.y, currentSize);

  notify("drawing-changed");
});

/*********************Event Listeners****************************************/
//add the exception function thingy
canvas.addEventListener("drawing-changed", () => {
  redraw();
});

canvas.addEventListener("tool-moved", () => {
  redraw(); // clear + draw lines
});

/*****************************************************************************/

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    line.display(ctx);
  }
  if (!cursor.active && currentPreview) {
    currentPreview.display(ctx);
  }
}

//use notify instead of dispatching a new event every time,
//from Prof Smiths code, but minus the bus
function notify(message: string) {
  canvas.dispatchEvent(new Event(message));
}

/********************************Buttons**************************************************** */
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
  currentSize = 4;
  setSelectedTool(thinButton);
  if (currentPreview) {
    currentPreview.updateThickness(currentSize);
  }
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick line";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  currentSize = 10;
  setSelectedTool(thickButton);
  if (currentPreview) {
    currentPreview.updateThickness(currentSize);
  }
});

//functionality for changing the selected button, rest in style.css
function setSelectedTool(selected: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((btn) =>
    btn.classList.remove("selectedTool")
  );
  selected.classList.add("selectedTool");
}
