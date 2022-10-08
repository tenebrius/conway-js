'use strict';
const getCoord = (i, length) => {
    return [i % length, Math.floor(i / length)]
}

const getIndex = (coord, length) => {
    return (coord[1] * length) + coord[0]
}

const getNeighbours = (points, length) => {
    const neighbours = []
    for (let i = 0; i < points.length; i++) {
        const neigh = []
        const coord = getCoord(i, length)
        const x = coord[0]
        const y = coord[1]

        //top left
        if (x > 0 && y > 0) {
            neigh.push(getIndex([coord[0] - 1, coord[1] - 1], length))
        }
        // top
        if (y > 0) {
            neigh.push(getIndex([coord[0], coord[1] - 1], length))
        }
        // top right
        if (x < (length - 1) && y > 0) {
            neigh.push(getIndex([coord[0] + 1, coord[1] - 1], length))
        }
        // left
        if (x > 0) {
            neigh.push(getIndex([coord[0] - 1, coord[1]], length))
        }
        // right
        if (x < length - 1) {
            neigh.push(getIndex([coord[0] + 1, coord[1]], length))
        }
        // bottom left
        if (x > 0 && y < (length - 1)) {
            neigh.push(getIndex([coord[0] - 1, coord[1] + 1], length))
        }
        // bottom
        if (y < (length - 1)) {
            neigh.push(getIndex([coord[0], coord[1] + 1], length))
        }
        // bottom right
        if (x < (length - 1) && y < (length - 1)) {
            neigh.push(getIndex([coord[0] + 1, coord[1] + 1], length))
        }
        neighbours.push(neigh)
    }
    return neighbours

}

const populateRandomly = (states, probability) => {
    for (let i = 0; i < states.length; i++) {
        states [i] = Math.random() > probability
    }
};

const generatePoints = (length) => {
    return Array(length * length).fill(false)
}

const applyConwayRule = (state, aliveCount) => {
    let result = state
    if (state) { // if alive
        //Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        //Any live cell with two or three live neighbours lives on to the next generation.
        //Any live cell with more than three live neighbours dies, as if by overpopulation.
        if ((aliveCount < 2) || (aliveCount >= 4)) {
            result = false
        }
    } else { //if dead
        //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (aliveCount === 3) {
            result = true
        }
    }
    return result
}


const drawSquare = (ctx, data, buf, x1, y1, length) => {
    //https://stackoverflow.com/questions/58482163/how-to-improve-html-canvas-performance-drawing-pixels
    var i = 0;
    const x2 = x1 + length
    const y2 = y1 + length
    for (var y = 0; y < 600; y++)
        for (var x = 0; x < 600; x++) {
            var d1 = (Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)) / 10) & 1;
            var d2 = (Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2)) / 10) & 1;
            buf[i++] = d1 == d2 ? 0xFF000000 : 0xFFFFFFFF;
        }
    // ctx.putImageData(data, 0, 0);
}
