class Line {
    constructor(type = 'content') {
        this.parts = [];
        this.type = type;
        this.hasAdded = false;
        this.hasRemoved = false;
        this.hasMatched = false;
    }

    addPart(text, className) {
        this.parts.push({ text, className });
        switch (className) {
            case 'removed':
                this.hasRemoved = true;
                break;
            case 'added':
                this.hasAdded = true;
                break;
            case 'match':
                this.hasMatched = true;
                break;
            default:
                break;
        }
    }

    render(container, lineNumber) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-container';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'line-content';

        this.parts.forEach(part => {
            const span = document.createElement('span');
            span.className = part.className;
            span.innerText = part.text;
            contentDiv.appendChild(span);
        });

        if (contentDiv.innerText === '' && this.type === 'content') {
            const br = document.createElement('br');
            contentDiv.appendChild(br);  // Insert a <br> tag for empty lines
        }

        const backgroundClass = this.determineBackgroundClass();
        if (backgroundClass) {
            contentDiv.classList.add(backgroundClass);
        }

        // Create line number element
        const lineNumberDiv = document.createElement('div');
        lineNumberDiv.className = 'line-number';
        lineNumberDiv.innerText = lineNumber;

        lineDiv.appendChild(lineNumberDiv);
        lineDiv.appendChild(contentDiv);
        container.appendChild(lineDiv);
    }

    determineBackgroundClass() {
        if (this.hasAdded && this.hasRemoved) {
            return 'line-added-removed';
        } else if (this.hasAdded) {
            return 'line-added-matched';
        } else if (this.hasRemoved) {
            return 'line-removed-matched';
        } else {
            return this.parts.length === 0 ? 'empty-line-added' : '';
        }
    }
}

export default Line;