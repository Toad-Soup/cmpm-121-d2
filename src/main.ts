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

//create a class for previewing the lil line dot drawing thing
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

//add a new class for sticker functionality
class PlaceSticker {
  private x: number;
  private y: number;
  private sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    //ctx.font = "24px serif";
    //ctx.fillText(this.sticker, this.x - 12, this.y + 8);
    ctx.font = `${stickerSize}px serif`;
    ctx.fillText(
      this.sticker,
      this.x - stickerSize / 2,
      this.y + stickerSize / 3,
    );
  }
}

//add anotha class for the preview the same way the cursor preview was done
class StickerPreview {
  private x: number;
  private y: number;
  private sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = `${stickerSize}px serif`;
    ctx.globalAlpha = 0.5;
    ctx.fillText(
      this.sticker,
      this.x - stickerSize / 2,
      this.y + stickerSize / 3,
    );
    ctx.restore();
  }
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.height = 256;
canvas.width = 256;

const cursor = { active: false, x: 0, y: 0 };

const lines: (PointHolder | PlaceSticker)[] = [];
const redoLines: (PointHolder | PlaceSticker)[] = [];

let currentLine: PointHolder | PlaceSticker | null = null;
let currentPreview: ToolPreview | StickerPreview | null = new ToolPreview(
  0,
  0,
  2,
);

let currentSize = 4;
let currentTool: "draw" | "sticker" = "draw";
let currentSticker = "🪼";

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  currentPreview = null;

  if (currentTool === "draw") {
    currentLine = new PointHolder(cursor.x, cursor.y, currentSize);
  } else if (currentTool === "sticker") {
    currentLine = new PlaceSticker(cursor.x, cursor.y, currentSticker);
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  redoLines.length = 0;
  notify("drawing-changed");

  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  if (cursor.active && currentLine) {
    // Only allow dragging for draw tool
    if (currentTool === "draw" && currentLine instanceof PointHolder) {
      currentLine.drag(cursor.x, cursor.y);
      notify("drawing-changed");
    }
  } else {
    //check what the current tool is and uodate the preview accordingly
    if (currentTool === "draw") {
      if (!currentPreview) {
        currentPreview = new ToolPreview(cursor.x, cursor.y, currentSize);
      } else if (currentPreview instanceof ToolPreview) {
        currentPreview.updatePosition(cursor.x, cursor.y);
      }
    } else {
      if (!currentPreview) {
        currentPreview = new StickerPreview(cursor.x, cursor.y, currentSticker);
      } else if (currentPreview instanceof StickerPreview) {
        currentPreview.updatePosition(cursor.x, cursor.y);
      }
    }
    notify("tool-moved");
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;

  if (currentTool === "draw") {
    currentPreview = new ToolPreview(cursor.x, cursor.y, currentSize);
    notify("drawing-changed");
  }
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

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

//button organization
const functContainer = document.createElement("div"); //container for undo redo and clear
const lineContainer = document.createElement("div"); //container for the thin and thick line buttons
const stickerContainer = document.createElement("div");

document.body.append(functContainer);
document.body.append(lineContainer);
document.body.append(stickerContainer);

//the following code is from Professor Smiths Quaint-Paint program
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
functContainer.append(undoButton);

undoButton.addEventListener("click", () => {
  const lastLine = lines.pop();
  if (lastLine) {
    redoLines.push(lastLine);
    redraw();
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
functContainer.append(redoButton);

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
functContainer.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.length = 0;
  redraw();
});

const thinButton = document.createElement("button");
thinButton.innerHTML = "thin line";
lineContainer.append(thinButton);

thinButton.addEventListener("click", () => {
  currentTool = "draw";
  currentSize = 4;
  setSelectedTool(thinButton);
  if (currentPreview instanceof ToolPreview) { //ty w3schools for this one. had no idea what to do for this
    currentPreview.updateThickness(currentSize);
  }
  notify("tool-moved");
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick line";
lineContainer.append(thickButton);

thickButton.addEventListener("click", () => {
  currentTool = "draw";
  currentSize = 10;
  setSelectedTool(thickButton);
  if (currentPreview instanceof ToolPreview) {
    currentPreview.updateThickness(currentSize);
  }
  notify("tool-moved");
});

//*************************** sticker buttons yippee **************************************//
//k had to get some outside help for this cos i literally could do something this advanced

const stickerSize = 48;

const stickers = [
  { emoji: "🪼" },
  { emoji: "🐟" },
  { emoji: "🐋" },
];

// Function to render all sticker buttons
function makeStickers() {
  // Clear old sticker buttons before re-rendering
  stickerContainer.innerHTML = "";

  // Create a button for each sticker in the array
  stickers.forEach(({ emoji }) => {
    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.classList.add("stickerButton");
    stickerContainer.append(btn);

    btn.addEventListener("click", () => {
      currentTool = "sticker";
      currentSticker = emoji;
      setSelectedTool(btn);
      currentPreview = new StickerPreview(cursor.x, cursor.y, emoji);
      notify("tool-moved");
    });
  });

  // make the custom sticker button at the end of the sticker button row
  const addStickerButton = document.createElement("button");
  addStickerButton.textContent = "Add Custom Sticker";
  stickerContainer.append(addStickerButton);

  addStickerButton.addEventListener("click", () => {
    const newSticker = prompt("Enter a custom sticker emoji or text:", "🌊"); //custom sticker button
    if (newSticker && newSticker.trim() !== "") {
      stickers.push({ emoji: newSticker.trim() });
      makeStickers(); //call the funct to add another custom sticker
    }
  });
}

makeStickers();

//functionality for changing the selected button, rest in style.css
function setSelectedTool(selected: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((btn) =>
    btn.classList.remove("selectedTool")
  );
  selected.classList.add("selectedTool");
}

//************************************ Export Button ************************************************** */
// Create an export button
const exportButton = document.createElement("button");
exportButton.textContent = "Export PNG";
document.body.append(exportButton);

exportButton.addEventListener("click", () => {
  //Create a new larger canvas (4x the size in each dimension)
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;

  //Get its drawing context
  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) return;

  exportCtx.fillStyle = "white";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  //Scale the context so drawings fill the larger canvas
  exportCtx.scale(4, 4); // 256 * 4 = 1024

  //edraw everything from your display list
  // (Do not include tool previews — only the actual lines/stickers)
  for (const line of lines) {
    line.display(exportCtx);
  }

  // Convert to PNG and trigger a download
  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});
