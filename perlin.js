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

function interpolate(t) {
    return 6*t**5 - 15*t**4 + 10*t**3;
}

function change_pixel_color(i, j, mono_color) {
    const imageData = ctx.createImageData(1, 1);
    imageData.data[0] = mono_color; // red
    imageData.data[1] = mono_color;   // green
    imageData.data[2] = mono_color;   // blue
    imageData.data[3] = 255;
    ctx.putImageData(imageData, i, j);
}

function limit(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function render_pixel(i, j, v1, v2, v3, v4) {
    const x_ratio = i / gridSize;
    const y_ratio = j / gridSize;
    const int_x = interpolate(x_ratio);
    const int_y = interpolate(y_ratio);
    const v = new Vector(x_ratio, y_ratio);
    const r1 = zero.subtract(v), d1 = r1.dot(v1);
    const r2 = ynorm.subtract(v), d2 = r2.dot(v2);
    const r3 = xnorm.add(ynorm).subtract(v), d3 = r3.dot(v3);
    const r4 = xnorm.subtract(v), d4 = r4.dot(v4);
    return limit((d1 * (1 - int_x) + d4 * int_x) * (1 - int_y) +
                 (d2 * (1 - int_x) + d3 * int_x) * int_y,
                 0,
                 1);
}

function render_cell(x, y, v1, v2, v3, v4) {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const mono_color = Math.floor(render_pixel(i, j, v1, v2, v3, v4) * 255);
            change_pixel_color(x*gridSize + i, y*gridSize + j, mono_color);
        }
    }
}

function drawCanvas(gridSize) {
    clearCanvas();
    drawGrid(gridSize, gridSize, 3, "#ffffff");
    for (let i = 0; i < Math.floor(canvas.width / gridSize); i++) {
        for (let j = 0; j < Math.floor(canvas.height / gridSize); j++) {
            const v1 = vec_lattice[j][i];
            const v2 = vec_lattice[j + 1][i];
            const v3 = vec_lattice[j + 1][i + 1];
            const v4 = vec_lattice[j][i + 1];
            render_cell(i, j, v1, v2, v3, v4);
        }
    }
}

angle_lattice = [];
vec_lattice = [];

function generate_random_angle() {
    Math.seed = seed;
    return Math.random() * 2 * Math.PI;
}

// Generate angle and vector lattices
for (let i = 0; i <= Math.floor(canvas.height / gridSize) + 1; i++) {
    let arr = [];
    for (let j = 0; j <= Math.floor(canvas.width / gridSize) + 1; j++) {
        const angle = generate_random_angle(seed + i * 1000 + j);
        arr.push(angle);
    }
    angle_lattice.push(arr);
}

for (let i = 0; i <= Math.floor(canvas.height / gridSize) + 1; i++) {
    let arr = [];
    for (let j = 0; j <= Math.floor(canvas.width / gridSize) + 1; j++) {
        arr.push(new Vector(Math.cos(angle_lattice[i][j]),
                            Math.sin(angle_lattice[i][j])));
    }
    vec_lattice.push(arr);
}

drawCanvas(gridSize);