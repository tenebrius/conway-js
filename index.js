'use strict';
const canvas = document.getElementById("canvas");
const randomBtn = document.getElementById("random");
const clearBtn = document.getElementById("clear");
const resumeBtn = document.getElementById("resume");
const pauseBtn = document.getElementById("pause");
const nextStepBtn = document.getElementById("next-step");
const lengthInput = document.getElementById("length");
const fpsInput = document.getElementById("fps");
const canvasLengthInput = document.getElementById("canvas-length");
const actualFpsText = document.getElementById("actual-fps");
const statusText = document.getElementById("status");
const patternsSelector = document.getElementById("patterns");
const ctx = canvas.getContext("2d");
let pausedText = 'paused';
let runningText = 'running';

const rle = new RLE()
let length = 100
let size = length * length
let fps = 500
let canvasLength = 1000;
let states
let adjacents
let unitLength;
let data;
let buf;
let animationId
let now, then, elapsed, fpsInterval, frames, prevFrameTime, fpsMeterInterval, actualFps;
var isMouseDown = false;
var creating = false
let changes = []
let drawChanges = []

const white = 0xFFFFFFFF;
const black = 0xFF000000;


const updateStatusText = () => {
    statusText.textContent = animationId ? runningText : pausedText
}

const setLengthToCanvas = () => {
    canvas.setAttribute('width', canvasLength)
    canvas.setAttribute('height', canvasLength)
}
setLengthToCanvas()

canvasLengthInput.value = canvasLength
canvasLengthInput.nextElementSibling.value = canvasLength
canvasLengthInput.onchange = (e) => {
    canvasLength = parseInt(e.currentTarget.value)
    canvasLengthInput.nextElementSibling.value = canvasLength
    setLengthToCanvas()
    stopLoop()
    init()
    random()
    draw()
}

lengthInput.value = length
lengthInput.value = length
lengthInput.nextElementSibling.value = length
lengthInput.onchange = (e) => {
    length = parseInt(e.currentTarget.value)
    lengthInput.nextElementSibling.value = length
    stopLoop()
    init()
    random()
    draw()
}

fpsInput.value = fps
fpsInput.nextElementSibling.value = fps
fpsInput.onchange = (e) => {
    fps = parseInt(e.currentTarget.value)
    fpsInput.nextElementSibling.value = fps
    stopLoop()
    startLoop()
}

resumeBtn.onclick = () => {
    startLoop()
}

pauseBtn.onclick = () => {
    stopLoop()
}


randomBtn.onclick = () => {
    stopLoop()
    random()
    draw()
}

clearBtn.onclick = () => {
    resetStates()
    draw()
}

nextStepBtn.onclick = () => {
    nextStep()
    draw()
}


canvas.onmousedown = function (e) {
    isMouseDown = true
    mouseEvent(e, true)
};
canvas.onmouseup = function () {
    isMouseDown = false
};
canvas.onmousemove = function (e) {
    if (isMouseDown) {
        mouseEvent(e)
    }
};

const resetStates = () => {
    states = generateStates(size)
    adjacents = getNeighbours(length)
}
const mouseEvent = (e, first) => {
    stopLoop()
    const pos = getCursorPosition(canvas, e)
    const coord = [Math.floor(pos[0] / unitLength), Math.floor(pos[1] / unitLength)]
    let index = getIndex(coord, length);
    if (first) {
        creating = states.get(index) === 1 ? 0 : 1
    }
    states.set(index, creating)
    draw()
}

const random = () => {
    populateRandomly(states, size, 0.08)
    draw()
}


const nextStep = () => {
    changes.length = 0
    let adj, state, adjStates, aliveCount, newState, change
    for (let i = 0; i < size; i++) {
        state = states.get(i)
        adj = adjacents[i]
        adjStates = adj.map(a => states.get(a));
        aliveCount = adjStates.filter(s => s === 1).length
        newState = applyConwayRule(state, aliveCount)
        if (newState !== state) {
            changes.push([i, newState])
            drawChanges.push([i, newState])
        }
    }
    for (let i = 0; i < changes.length; i++) {
        change = changes[i];
        states.set(change[0], change[1])
    }
}


let coord, canvasCoord, start, end, change
const drawPos = (i, state) => {
    coord = getCoord(i, length)

    let color = state === 1 ? black : white;
    for (let s = 0; s < unitLength; s++) {
        canvasCoord = [coord[0] * unitLength, coord[1] * unitLength];
        start = getIndex([canvasCoord[0], canvasCoord[1] + s], canvasLength);
        end = getIndex([canvasCoord[0] + unitLength, canvasCoord[1] + s], canvasLength);
        buf.fill(color, start, end)
    }
}

const draw = (changesOnly) => {


    if (changesOnly) {
        for (let p = 0; p < drawChanges.length; p++) {
            change = drawChanges[p]
            drawPos(change[0], change[1])
        }
        drawChanges.length = 0
    } else {
        for (let i = 0; i < (size); i++) {
            drawPos(i, states.get(i))
        }
    }


    ctx.putImageData(data, 0, 0);
}


const animate = () => {
    animationId = setTimeout(animate, fpsInterval)
    // calc elapsed time since last loop

    now = performance.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        nextStep()
        draw(true)

        calculateActualFps()

    }

}

const calculateActualFps = () => {
    fpsMeterInterval = now - prevFrameTime;
    actualFps = Math.round((frames * 1000) / fpsMeterInterval);
    frames++
    if (fpsMeterInterval > 3000) {
        actualFpsText.textContent = actualFps
        frames = 0
        prevFrameTime = now
    }
}
const initActualFpsMeter = () => {
    prevFrameTime = then
    frames = 0
}
const startLoop = () => {
    if (!animationId) {
        fpsInterval = 1000 / fps
        then = performance.now();
        initActualFpsMeter()
        animate()
        updateStatusText()
    }
}

const stopLoop = () => {
    clearTimeout(animationId)
    animationId = null
    updateStatusText()
}


const populatePatternSelector = () => {
    for (const pattern of patterns) {
        var tag = document.createElement("div");
        tag.setAttribute("data-pattern", pattern[2]);
        tag.textContent = pattern[0]
        tag.onclick = (e) => {
            const patternString = e.currentTarget.getAttribute('data-pattern')
            resetStates()
            loadPattern(patternString, states)
            draw()
        }
        patternsSelector.appendChild(tag);
    }
}

const init = () => {
    size = length * length
    unitLength = Math.ceil(canvasLength / length)
    data = ctx.createImageData(canvasLength, canvasLength);
    buf = new Uint32Array(data.data.buffer);
    resetStates()

}


const main = () => {
    init()
    random()
    populatePatternSelector()
    updateStatusText()
}
main()

