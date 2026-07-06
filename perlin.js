const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const seedInput = document.getElementById("seed");
const sizeInput = document.getElementById("size");

const seed = parseInt(seedInput.value) || 4205834029;
const gridSize = parseInt(sizeInput.value) || 10;

class Vector {
constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
}

const zero = new Vector(0, 0);

const xvec = new Vector(canvas.width, 0);
const yvec = new Vector(0, canvas.height);

const xgrid = new Vector(gridSize, 0);
const ygrid = new Vector(0, gridSize);

const xnorm = new Vector(1, 0);
const ynorm = new Vector(0, 1);

function clearCanvas() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLine(start, end, thickness = 3, color = "#ffffff") {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function drawGrid(gridW, gridH = null, thickness = 3, color = "#ffffff") {
    if (gridH === null) gridH = gridW;

    for (let vec = ygrid; vec.y <= canvas.height; vec = vec.add(ygrid)) {
        drawLine(vec,
                 vec.add(xvec),
                 thickness,
                 color);
    }

    for (let vec = xgrid; vec.x <= canvas.width; vec = vec.add(xgrid)) {
        drawLine(vec,
                 vec.add(yvec),
                 thickness,
                 color);
    }
}

