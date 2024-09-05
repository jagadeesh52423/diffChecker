import Line from './Line.js';

class SplitWindow {
    constructor() {
        this.leftLines = [];
        this.rightLines = [];
        this.leftIndex = 0;
        this.rightIndex = 0;
        this.currentLeftLine = new Line();
        this.currentRightLine = new Line();
        this.leftLineContentFound = false;
        this.rightLineContentFound = false;
    }

    addRemovedText(part) {
        this.currentLeftLine.addPart(part, 'removed');
        this.leftLineContentFound = true;
    }

    addMatchingText(part) {
        this.currentLeftLine.addPart(part, 'match');
        this.currentRightLine.addPart(part, 'match');
        this.leftLineContentFound = true;
        this.rightLineContentFound = true;
    }

    addAddedText(part) {
        this.currentRightLine.addPart(part, 'added');
        this.rightLineContentFound = true;
    }

    closeLine() {
        this.leftLines.push(this.currentLeftLine);
        this.rightLines.push(this.currentRightLine);

        this.currentLeftLine = new Line();
        this.currentRightLine = new Line();
        this.leftLineContentFound = false;
        this.rightLineContentFound = false;
    }

    render(leftContainer, rightContainer) {
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';

        let leftLineNumber = 1;
        let rightLineNumber = 1;

        for (let i = 0; i < this.leftLines.length; i++) {
            const leftLineHeight = this.renderLine(this.leftLines[i], leftContainer, leftLineNumber);
            const rightLineHeight = this.renderLine(this.rightLines[i], rightContainer, rightLineNumber);

            // Balance the lines
            const heightDiff = Math.abs(leftLineHeight - rightLineHeight);
            if (heightDiff > 0) {
                const container = leftLineHeight < rightLineHeight ? leftContainer : rightContainer;
                for (let j = 0; j < heightDiff; ) {
                    let emptyLineHeight = this.renderEmptyLine(container);
                    j += emptyLineHeight;
                }
            }

            if (this.leftLines[i].hasMatched || this.leftLines[i].hasRemoved) leftLineNumber++;
            if (this.rightLines[i].hasMatched || this.rightLines[i].hasAdded) rightLineNumber++;
        }
    }

    renderLine(line, container, lineNumber) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-container';

        const lineNumberDiv = document.createElement('div');
        lineNumberDiv.className = 'line-number';
        lineNumberDiv.innerText = line.hasMatched || line.hasRemoved || line.hasAdded ? lineNumber : '';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'line-content';

        line.parts.forEach(part => {
            const span = document.createElement('span');
            span.className = part.className;
            span.innerText = part.text;
            contentDiv.appendChild(span);
        });

        if (contentDiv.innerText === '') {
            const br = document.createElement('br');
            contentDiv.appendChild(br);
        }

        const backgroundClass = line.determineBackgroundClass();
        if (backgroundClass) {
            contentDiv.classList.add(backgroundClass);
        }

        lineDiv.appendChild(lineNumberDiv);
        lineDiv.appendChild(contentDiv);
        container.appendChild(lineDiv);

        // Return the rendered height of the line
        return lineDiv.offsetHeight;
    }

    renderEmptyLine(container) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-container';

        const lineNumberDiv = document.createElement('div');
        lineNumberDiv.className = 'line-number';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'line-content empty-line-added';
        contentDiv.innerHTML = '<br>';

        lineDiv.appendChild(lineNumberDiv);
        lineDiv.appendChild(contentDiv);
        container.appendChild(lineDiv);
        return lineDiv.offsetHeight;
    }
}

export default SplitWindow;