function make_perlin_ctx(canvas, seed, gridSize) {
    return new PerlinContext(
        document.getElementById(canvas),
        parseInt(document.getElementById(seed).value) || 4205834029,
        parseInt(document.getElementById(gridSize).value) || 10
    );
}

function animate(ctx, collor_pallete) {
    // update objects
    for (let i = 0; i <= Math.floor(ctx.canvas.height / ctx.gridSize) + 1; i++) {
        for (let j = 0; j <= Math.floor(ctx.canvas.width / ctx.gridSize) + 1; j++) {
            ctx.modify_lattice(i, j, ctx.angle_lattice[i][j] + 0.1);
        }
    }

    // draw objects
    drawCanvas(ctx);
    for (let i = 0; i < ctx.canvas.width; i++) {
        for (let j = 0; j < ctx.canvas.height; j++) {
            const idx = (j * ctx.canvas.width + i) * 4;
            const current_color = ctx.frameBuffer.data[idx];
            const new_color = discretize_color(current_color, { palette: water_color_pallet });
            change_pixel_color(ctx, i, j, new_color);
        }
    }
    ctx.ctx.putImageData(ctx.frameBuffer, 0, 0);
    

    requestAnimationFrame(() => animate(ctx, collor_pallete));
}

let perlin = make_perlin_ctx("canvas", "seed", "size");
perlin.generate_lattice();

const water_color_pallet = [
    [15, 32, 80],    // deep navy
    [28, 57, 120],   // strong blue
    [45, 86, 155],   // ocean blue
    [70, 115, 185],  // blue sky
    [102, 148, 210], // lighter sea
    [135, 178, 225], // pale aqua
    [170, 204, 238], // light blue
    [205, 228, 248], // very light blue
    [235, 245, 255]  // almost white blue
];

animate(perlin, water_color_pallet);