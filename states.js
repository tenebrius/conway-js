function States(length, array) {
    if (array) {
        this.array = new Uint8Array(array)
    } else {
        this.array = new Uint8Array(length)
    }

    this.get = (i) => {
        return this.array[i]
    }

    this.set = (i, val) => {
        this.array[i] = val
    }

    this.setAll = (array) => {
        this.array = [...array]
    }
}