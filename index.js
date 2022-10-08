'use strict';
const canvas = document.getElementById("canvas");
const restartBtn = document.getElementById("restart");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const ctx = canvas.getContext("2d");


let running = true
const length = 400
let canvasLength = canvas.offsetWidth;
const unitLength = Math.floor(canvasLength / length)

var data = ctx.createImageData(canvasLength, canvasLength);
var buf = new Uint32Array(data.data.buffer);
console.log("buf length", buf.length)
startBtn.onclick = () => {
    running = true
}

stopBtn.onclick = () => {
    running = false
}


restartBtn.onclick = () => {
    populateRandomly(states, 0.02)
}

const states = generatePoints(length)
const adjacents = getNeighbours(states, length)
populateRandomly(states, 0.02)

const nextStep = () => {
    for (let i = 0; i < states.length; i++) {
        const state = states[i]
        const adj = adjacents[i]
        let adjStates = adj.map(a => states[a]);
        const aliveCount = adjStates.filter(s => s === true).length
        const newState = applyConwayRule(state, aliveCount)
        states[i] = newState
    }
}


const draw = () => {
    for (let i = 0; i < states.length; i++) {
        const state = states[i]
        const coord = getCoord(i, length)
        let x = coord[0];
        let y = coord[1];
        // ctx.fillStyle = state === true ? "red" : 'white';
        let color = state === true ? 0xFF000000 : 0xFFFFFFFF;
        for (let s = 0; s < unitLength; s++) {
            let canvasCoord = [x * unitLength, y * unitLength];
            let start = getIndex([canvasCoord[0], canvasCoord[1] + s], canvasLength);
            let end = getIndex([canvasCoord[0] + unitLength, canvasCoord[1] + s], canvasLength);
            buf.fill(color, start, end)
        }
        // drawSquare(ctx, data, buf, x, y, length)
        // draw1(x, y, x + unitLength, y + unitLength)
    }

    ctx.putImageData(data, 0, 0);
}


setInterval(() => {
    if (running) {
        draw()
        nextStep()
    }
}, 50)