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

function generate_random_angle() {
    Math.seed = seed;
    return Math.random() * 2 * Math.PI;
}

class PerlinContext {
    static zero = new Vector(0, 0);

    static xnorm = new Vector(1, 0);
    static ynorm = new Vector(0, 1);

    constructor(canvas, seed, gridSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.xvec = new Vector(this.ctx.canvas.width, 0);
        this.yvec = new Vector(0, this.ctx.canvas.height);

        this.seed = seed;
        this.gridSize = gridSize;
        this.zero = PerlinContext.zero;
        this.xnorm = PerlinContext.xnorm;
        this.ynorm = PerlinContext.ynorm;
        this.xgrid = new Vector(this.gridSize, 0);
        this.ygrid = new Vector(0, this.gridSize);
        this.angle_lattice = [];
        this.vec_lattice = [];
        this.frameBuffer = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        // Start fully opaque black so edge pixels outside the cell grid aren't transparent
        for (let k = 3; k < this.frameBuffer.data.length; k += 4) {
            this.frameBuffer.data[k] = 255;
        }
    }

    generate_lattice() {
        // Generate angle and vector lattices
        for (let i = 0; i <= Math.floor(this.canvas.height / this.gridSize) + 1; i++) {
            let arr = [];
            for (let j = 0; j <= Math.floor(this.canvas.width / this.gridSize) + 1; j++) {
                const angle = generate_random_angle(this.seed + i * 1000 + j);
                arr.push(angle);
            }
            this.angle_lattice.push(arr);
        }

        for (let i = 0; i <= Math.floor(this.canvas.height / this.gridSize) + 1; i++) {
            let arr = [];
            for (let j = 0; j <= Math.floor(this.canvas.width / this.gridSize) + 1; j++) {
                arr.push(new Vector(Math.cos(this.angle_lattice[i][j]),
                                    Math.sin(this.angle_lattice[i][j])));
            }
            this.vec_lattice.push(arr);
        }
    }

    modify_lattice(i, j, new_angle) {
        this.angle_lattice[i][j] = new_angle;
        this.vec_lattice[i][j] = new Vector(Math.cos(new_angle), Math.sin(new_angle));
    }
}

function clearCanvas(ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

function drawLine(ctx, start, end, thickness = 3, color = "#ffffff") {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function drawGrid(ctx, thickness = 3, color = "#ffffff") {

    for (let vec = ctx.ygrid; vec.y <= ctx.canvas.height; vec = vec.add(ctx.ygrid)) {
        drawLine(ctx, vec,
                 vec.add(ctx.xgrid),
                 thickness,
                 color);
    }

    for (let vec = ctx.xgrid; vec.x <= ctx.canvas.width; vec = vec.add(ctx.xgrid)) {
        drawLine(ctx, vec,
                 vec.add(ctx.ygrid),
                 thickness,
                 color);
    }
}

function drawVector(ctx, pos_vector, vector, thickness = 3, color = "#ffffff") {
    // We need to calculate the positions of 2 nontrivial points:
    // aka the points representing the arrowhead of the vector.
    start = pos_vector;
    end = pos_vector.add(vector.multiply(ctx.gridSize*0.3));

    // Calculate the angle of the vector
    const angle = Math.atan2(vector.y, vector.x);
    const angle1 = angle + Math.PI / 6 + Math.PI; // 30 degrees
    const angle2 = angle - Math.PI / 6 + Math.PI; // 30 degrees

    small_vector1 = new Vector(Math.cos(angle1), Math.sin(angle1)).multiply(10);
    small_vector2 = new Vector(Math.cos(angle2), Math.sin(angle2)).multiply(10);

    drawLine(ctx, start, end, thickness, color);
    drawLine(ctx, end, end.add(small_vector1), thickness, color);
    drawLine(ctx, end, end.add(small_vector2), thickness, color);
}

function interpolate(t) {
    return 6*t**5 - 15*t**4 + 10*t**3;
}

function change_pixel_color(ctx, i, j, color) {
    const idx = (j * ctx.canvas.width + i) * 4;
    if (Array.isArray(color)) {
        ctx.frameBuffer.data[idx] = clamp(color[0], 0, 255);
        ctx.frameBuffer.data[idx + 1] = clamp(color[1], 0, 255);
        ctx.frameBuffer.data[idx + 2] = clamp(color[2], 0, 255);
        ctx.frameBuffer.data[idx + 3] = color[3] === undefined ? 255 : clamp(color[3], 0, 255);
        return;
    }

    const mono_color = clamp(color, 0, 255);
    ctx.frameBuffer.data[idx] = mono_color;     // red
    ctx.frameBuffer.data[idx + 1] = mono_color; // green
    ctx.frameBuffer.data[idx + 2] = mono_color; // blue
    ctx.frameBuffer.data[idx + 3] = 255;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function render_pixel(ctx, i, j, v1, v2, v3, v4) {
    const x_ratio = i / ctx.gridSize;
    const y_ratio = j / ctx.gridSize;
    const int_x = interpolate(x_ratio);
    const int_y = interpolate(y_ratio);
    const v = new Vector(x_ratio, y_ratio);
    const r1 = ctx.zero.subtract(v), d1 = r1.dot(v1);
    const r2 = ctx.ynorm.subtract(v), d2 = r2.dot(v2);
    const r3 = ctx.xnorm.add(ctx.ynorm).subtract(v), d3 = r3.dot(v3);
    const r4 = ctx.xnorm.subtract(v), d4 = r4.dot(v4);
    return (d1 * (1 - int_x) + d4 * int_x) * (1 - int_y) +
           (d2 * (1 - int_x) + d3 * int_x) * int_y
}

function render_cell(ctx, x, y, v1, v2, v3, v4) {
    for (let i = 0; i < ctx.gridSize; i++) {
        for (let j = 0; j < ctx.gridSize; j++) {
            const mono_color = clamp(Math.floor((render_pixel(ctx, i, j, v1, v2, v3, v4)+1)*0.5 * 255), 0, 255); // remap and clamp
            change_pixel_color(ctx, x*ctx.gridSize + i, y*ctx.gridSize + j, [mono_color, mono_color, mono_color, 255]);
        }
    }
}

function drawCanvas(ctx) {
    for (let i = 0; i < Math.floor(ctx.canvas.width / ctx.gridSize); i++) {
        for (let j = 0; j < Math.floor(ctx.canvas.height / ctx.gridSize); j++) {
            const v1 = ctx.vec_lattice[j][i];
            const v2 = ctx.vec_lattice[j + 1][i];
            const v3 = ctx.vec_lattice[j + 1][i + 1];
            const v4 = ctx.vec_lattice[j][i + 1];
            render_cell(ctx, i, j, v1, v2, v3, v4);
        }
    }
}

function discretize_color(mono_color, options = {}) {
    if (typeof options === "number") {
        options = { num_colors: options };
    }

    if (Array.isArray(options)) {
        options = { palette: options };
    }

    const palette = options.palette;
    if (Array.isArray(palette) && palette.length > 0) {
        const count = palette.length;
        const index = Math.min(count - 1, Math.floor(mono_color * count / 256));
        const entry = palette[index];
        if (Array.isArray(entry)) {
            return [
                clamp(entry[0], 0, 255),
                clamp(entry[1], 0, 255),
                clamp(entry[2], 0, 255),
                entry[3] === undefined ? 255 : clamp(entry[3], 0, 255)
            ];
        }
        return [mono_color, mono_color, mono_color, 255];
    }

    const num_colors = Number.isFinite(options.num_colors) ? options.num_colors : 2;
    const step = 255 / (num_colors - 1);
    return Math.round(mono_color / step) * step;
}