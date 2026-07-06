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

