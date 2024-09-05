import Line from './Line.js';

class CombinedWindow {
    constructor() {
        this.lines = [];
        this.currentLine = new Line();
        this.index = 0;
    }

    addRemovedText(part) {
        this.currentLine.addPart(part, 'removed');
    }

    addMatchingText(part) {
        this.currentLine.addPart(part, 'match');
    }

    addAddedText(part) {
        this.currentLine.addPart(part, 'added');
    }

    closeLine() {
        this.lines.push(this.currentLine);
        this.index++;
        this.currentLine = new Line();
    }

    render(container) {
        container.innerHTML = '';

        let lineNumber = 1;

        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].render(container, this.lines[i].hasMatched || this.lines[i].hasRemoved || this.lines[i].hasAdded ? lineNumber++ : '');
        }
    }
}

export default CombinedWindow;