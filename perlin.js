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

function drawVector(pos_vector, vector, thickness = 3, color = "#ffffff") {
    // We need to calculate the positions of 2 nontrivial points:
    // aka the points representing the arrowhead of the vector.
    start = pos_vector;
    end = pos_vector.add(vector.multiply(gridSize*0.3));

    // Calculate the angle of the vector
    const angle = Math.atan2(vector.y, vector.x);
    const angle1 = angle + Math.PI / 6 + Math.PI; // 30 degrees
    const angle2 = angle - Math.PI / 6 + Math.PI; // 30 degrees

    small_vector1 = new Vector(Math.cos(angle1), Math.sin(angle1)).multiply(10);
    small_vector2 = new Vector(Math.cos(angle2), Math.sin(angle2)).multiply(10);

    drawLine(start, end, thickness, color);
    drawLine(end, end.add(small_vector1), thickness, color);
    drawLine(end, end.add(small_vector2), thickness, color);
}

function drawCanvas(seed, gridSize) {
    clearCanvas();
    drawGrid(gridSize, gridSize, 3, "#ffffff");
}
drawCanvas(seed, gridSize);
drawVector(xgrid.add(ygrid), new Vector(1, 1), 3, "#ccc");