class Stack {
    items = []
    l = -1
    push(obj) {
        this.items.push(obj)
        this.l++
    }
    pop() {
        if (this.l < 0) {
            return
        }
        const element = this.items.pop()
        this.l--
        return element
    }

    peek() {
        return this.items[this.l]
    }

    empty() {
        return this.items.length = 0
    }
}

class Block {
    indent = 0

    constructor(indent) {
        this.indent = indent
    }
}

class Line {
    sentence = ""

    addCharacterInSentence(character) {
        if (this.sentence.length === 0) {
            this.sentence = `${character}`
        } else {
            this.sentence = `${this.sentence}${character}`
        }
    }

    getSentence() {
        return this.sentence
    }

    started() {
        return this.sentence.trim() === ''
    }
}
function indentCode(codeStr) {
    console.log("CODE_STR", codeStr)
    const stack = new Stack()
    const block = new Block(0)
    stack.push(block)
    var newLines = []
    var currLine = new Line()
    var ended = false
    for (let ch of codeStr) {
        var indent = stack.peek().indent
        ended = false
        if (ch === '{') {
            stack.push(new Block(indent + 1))
            ended = true
        } else if (ch === '}') {
            stack.pop()
            indent = stack.peek().indent
            ended = true
        } else if (!currLine.sentence.trim().startsWith("for") && ch === ';') {
            ended = true
        }
        if (currLine.started() && ch !== ' ') {
            currLine.addCharacterInSentence(new Array(indent).fill("  ").join(""))
        }
        if (!(currLine.started() && ch === '')) {
            currLine.addCharacterInSentence(ch)
        }
        if (ended) {
            console.log("ENDED", ch)
            newLines.push(currLine)
            currLine = new Line()
        }
    }
    if (!ended) {
        newLines.push(currLine)
    }
    console.log("NEW_LINES", newLines)
    return newLines.map(line => line.sentence).join("<br>")
}

export default indentCode