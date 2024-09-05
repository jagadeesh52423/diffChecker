class DiffChecker {
    constructor() {
        this.memo = new Map();
    }

    splitIntoDoubleDimensionalArray(data, splitBy) {
        const lines = data.split('\n');
        return lines.map(line => {
            if (splitBy === "character") {
                if (line === "") {
                    return [""];
                }
                return line.split('');
            } else if (splitBy === "word") {
                if (line === "") {
                    return [""];
                }
                const regex = /([a-zA-Z0-9]+|\s|[^\w\s])/g;
                return line.match(regex) || [];
            } else if (splitBy === "line") {
                return line === "" ? [""] : [line];  // Each line is an entry as a whole
            } else {
                throw new Error("Invalid splitBy criterion. Use 'character', 'word', or 'line'.");
            }
        });
    }

    createKey(str1, str2) {
        return JSON.stringify([str1, str2]);
    }

    findLCS(text1, text2) {
        const m = text1.length;
        const n = text2.length;
        const key = this.createKey(text1, text2);

        if (this.memo.has(key)) {
            return this.memo.get(key);
        }

        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (text1[i - 1] === text2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        this.memo.set(key, dp);
        return dp;
    }

    findLCSLines(data1, data2) {
        const m = data1.length;
        const n = data2.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const innerDp = this.findLCS(data1[i - 1], data2[j - 1]);
                const comparisonValue = innerDp[data1[i - 1].length][data2[j - 1].length];
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1] + comparisonValue);
            }
        }

        return dp;
    }

    traceBackLCS(data1, data2, dp) {
        let i = data1.length;
        let j = data2.length;
        const matchingLines1 = Array(data1.length).fill(-1);
        const matchingLines2 = Array(data2.length).fill(-1);

        while (i > 0 && j > 0) {
            if (dp[i][j] === dp[i - 1][j]) {
                i--;
            } else if (dp[i][j] === dp[i][j - 1]) {
                j--;
            } else {
                matchingLines1[i - 1] = j - 1;
                matchingLines2[j - 1] = i - 1;
                i--;
                j--;
            }
        }

        return { matchingLines1, matchingLines2 };
    }

    diffChecker(originalData, updatedData) {
        const dp = this.findLCSLines(originalData, updatedData);
        const { matchingLines1, matchingLines2 } = this.traceBackLCS(originalData, updatedData, dp);
        return { matchingLines1, matchingLines2, originalData, updatedData };
    }

    processArrays(arr1, arr2, type) {
        let resultIndexes = [];
        let i = 0, j = 0;

        while (i < arr1.length && j < arr2.length) {
            if (arr2[arr1[i]] === i && arr1[arr2[j]] === j) {
                resultIndexes.push(['match', i, arr1[i]]);
                i++;
                j++;
            } else if (arr1[i] === -1 && arr2[j] === -1 && type === 'line') {
                resultIndexes.push(['match', i, j]);
                i++;
                j++;
            } else if (arr1[i] === -1) {
                resultIndexes.push(['remove', i, -1]);
                i++;
            } else if (arr2[j] === -1) {
                resultIndexes.push(['added', -1, j]);
                j++;
            } else {
                console.log("Error in processing arrays.");
            }
        }

        while (i < arr1.length) {
            resultIndexes.push(['remove', i, -1]);
            i++;
        }

        while (j < arr2.length) {
            resultIndexes.push(['added', -1, j]);
            j++;
        }

        return resultIndexes;
    }

    displayResult(originalData, updatedData, matchingLines1, matchingLines2, windowType) {
        let resultWindow;
        let containers;

        if (windowType === 'SplitWindow') {
            resultWindow = new SplitWindow();
            containers = {
                left: document.getElementById('result-left-container'),
                right: document.getElementById('result-right-container')
            };
        } else if (windowType === 'CombinedWindow') {
            resultWindow = new CombinedWindow();
            containers = {
                center: document.getElementById('result-center-container')
            };
        } else {
            throw new Error("Invalid windowType. Use 'SplitWindow' or 'CombinedWindow'.");
        }

        const resultConditions = this.processArrays(matchingLines1, matchingLines2, 'line');

        // Calculate counts
        let deletions = 0, insertions = 0, matches = 0, modifications = 0;
        
        // Show loading spinner
        document.querySelector('.loading-spinner').style.display = 'flex';

        // Use requestAnimationFrame to process results in chunks
        const chunkSize = 100;
        let index = 0;

        const processChunk = () => {
            const endIndex = Math.min(index + chunkSize, resultConditions.length);

            for (let i = index; i < endIndex; i++) {
                const [status, origIndex, updIndex] = resultConditions[i];
                if (status === 'match') {
                    const originalLine = originalData[origIndex];
                    const updatedLine = updatedData[updIndex];
                    const innerDp = this.findLCS(originalLine, updatedLine);
                    const { matchingLines1: innerMatchingLines1, matchingLines2: innerMatchingLines2 } = this.traceBackLCS(originalLine, updatedLine, innerDp);
                    const innerResults = this.processArrays(innerMatchingLines1, innerMatchingLines2, 'character|word');
                    
                    let isFullMatch = true;
                    innerResults.forEach(([innerStatus, innerOrigIndex, innerUpdIndex]) => {
                        const originalPart = innerOrigIndex !== -1 ? originalLine[innerOrigIndex] : '';
                        const updatedPart = innerUpdIndex !== -1 ? updatedLine[innerUpdIndex] : '';
                        if (innerStatus === 'match') {
                            resultWindow.addMatchingText(originalPart);
                        } else if (innerStatus === 'remove') {
                            resultWindow.addRemovedText(originalPart);
                            isFullMatch = false;
                        } else if (innerStatus === 'added') {
                            resultWindow.addAddedText(updatedPart);
                            isFullMatch = false;
                        }
                    });
                    
                    if (isFullMatch) {
                        matches++;
                    } else {
                        modifications++;
                    }
                    
                    resultWindow.closeLine();
                } else if (status === 'remove') {
                    const originalLine = originalData[origIndex].join('');
                    resultWindow.addRemovedText(originalLine);
                    resultWindow.closeLine();
                    deletions++;
                } else if (status === 'added') {
                    const updatedLine = updatedData[updIndex].join('');
                    resultWindow.addAddedText(updatedLine);
                    resultWindow.closeLine();
                    insertions++;
                }
            }

            index = endIndex;

            if (index < resultConditions.length) {
                requestAnimationFrame(processChunk);
            } else {
                // Rendering is complete
                if (windowType === 'SplitWindow') {
                    this.displayCounts(containers.left, deletions, 0, matches, modifications);
                    this.displayCounts(containers.right, 0, insertions, matches, modifications);
                    resultWindow.render(containers.left.querySelector('.result-view'), containers.right.querySelector('.result-view'));
                    this.syncScroll([containers.left, containers.right]);
                } else if (windowType === 'CombinedWindow') {
                    this.displayCounts(containers.center, deletions, insertions, matches, modifications);
                    resultWindow.render(containers.center.querySelector('.result-view'));
                    this.syncScroll([containers.center]);
                }

                // Hide loading spinner
                document.querySelector('.loading-spinner').style.display = 'none';
            }
        };

        requestAnimationFrame(processChunk);
    }

    displayCounts(container, deletions, insertions, matches, modifications) {
        console.log(`Displaying counts for container:`, container); // Debug log

        // Remove existing count divisions
        const existingCounts = container.querySelectorAll('.diff-counts');
        existingCounts.forEach(count => count.remove());

        const countsDiv = document.createElement('div');
        countsDiv.className = 'diff-counts';
        
        if (deletions > 0) {
            countsDiv.innerHTML += `<span class="count-deletions">Deletions: ${deletions}</span>`;
        }
        if (insertions > 0) {
            countsDiv.innerHTML += `<span class="count-insertions">Insertions: ${insertions}</span>`;
        }
        if (matches > 0) {
            countsDiv.innerHTML += `<span class="count-matches">Matches: ${matches}</span>`;
        }
        if (modifications > 0) {
            countsDiv.innerHTML += `<span class="count-modifications">Modifications: ${modifications}</span>`;
        }

        console.log(`Counts HTML:`, countsDiv.innerHTML); // Debug log
        container.insertBefore(countsDiv, container.firstChild);
    }

    syncScroll(divs) {
        const onScroll = (scrolledDiv) => {
            divs.forEach(div => {
                if (div !== scrolledDiv) {
                    div.scrollTop = scrolledDiv.scrollTop;
                    div.scrollLeft = scrolledDiv.scrollLeft;
                }
            });
        };

        divs.forEach(div => {
            div.addEventListener('scroll', () => onScroll(div));
        });
    }

    escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }
}

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
            console.log(`Left line ${leftLineNumber} height: ${leftLineHeight}, Right line ${rightLineNumber} height: ${rightLineHeight}`); // Debug log

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

const diffChecker = new DiffChecker();