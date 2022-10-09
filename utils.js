'use strict';


const getCoord = (i, length) => {
    return [i % length, Math.floor(i / length)]
}

const getIndex = (coord, length) => {
    return (coord[1] * length) + coord[0]
}

const getNeighbours = (length) => {
    const neighbours = []
    for (let i = 0; i < length * length; i++) {
        const neigh = []
        const coord = getCoord(i, length)
        const x = coord[0]
        const y = coord[1]

        //top left
        neigh.push(getIndex([x > 0 ? coord[0] - 1 : length - 1, y > 0 ? coord[1] - 1 : length - 1], length))
        // top
        neigh.push(getIndex([coord[0], y > 0 ? coord[1] - 1 : length - 1], length))
        // top right
        neigh.push(getIndex([x < (length - 1) ? coord[0] + 1 : 0, y > 0 ? coord[1] - 1 : length - 1], length))
        // left
        neigh.push(getIndex([x > 0 ? coord[0] - 1 : length - 1, coord[1]], length))
        // right
        neigh.push(getIndex([(x < length - 1) ? coord[0] + 1 : 0, coord[1]], length))
        // bottom left
        neigh.push(getIndex([x > 0 ? coord[0] - 1 : length - 1, y < (length - 1) ? coord[1] + 1 : 0], length))
        // bottom
        neigh.push(getIndex([coord[0], y < (length - 1) ? coord[1] + 1 : 0], length))
        // bottom right
        neigh.push(getIndex([x < (length - 1) ? coord[0] + 1 : 0, y < (length - 1) ? coord[1] + 1 : 0], length))

        neighbours.push(neigh)
    }
    return neighbours

}

const populateRandomly = (states, length, probability) => {
    for (let i = 0; i < length; i++) {
        states.set(i, Math.random() < probability ? 1 : 0)
    }
};

const generateStates = (length) => {
    return new States(length);
}

const applyConwayRule = (state, aliveCount) => {
    let result = state
    if (state) { // if alive
        //Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        //Any live cell with two or three live neighbours lives on to the next generation.
        //Any live cell with more than three live neighbours dies, as if by overpopulation.
        if ((aliveCount < 2) || (aliveCount >= 4)) {
            result = 0
        }
    } else { //if dead
        //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (aliveCount === 3) {
            result = 1
        }
    }
    return result
}


const getCursorPosition = (canvas, event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y]
}

const trim = (str, ch) => {
    var start = 0,
        end = str.length;

    while (start < end && str[start] === ch)
        ++start;

    while (end > start && str[end - 1] === ch)
        --end;

    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}


const loadPattern = (patternString, states) => {
    const pattern = rle.decode(patternString)
    let x = 0
    let y = 0
    for (const char of pattern) {

        if (char === '$') {
            y++
            x = 0
        }
        if (char === '!') {
            break
        }
        if (char === 'b') {
            x++
        }
        if (char === 'o') {
            x++
        }

    }

    const patternStart = [Math.floor((length / 2) - (x / 2)), Math.floor((length / 2) - (y / 2))]
    let initialX = patternStart[0]
    x = patternStart[0]
    y = patternStart[1]
    for (const char of pattern) {
        let coord = [x, y];

        if (char === '$') {
            y++
            x = initialX
            continue
        }
        if (char === '!') {
            break
        }
        if (char === 'b') {
            states.set(getIndex(coord, length), 0)
            x++
            continue
        }
        if (char === 'o') {
            states.set(getIndex(coord, length), 1)
            x++
            console.log(coord)
            continue
        }

    }

}