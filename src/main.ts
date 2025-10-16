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

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});
