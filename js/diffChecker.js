class Line {
    constructor() {
        this.parts = [];
    }

    addPart(text, className) {
        this.parts.push({ text, className });
    }

    render(container) {
        const lineDiv = document.createElement('div');
        this.parts.forEach(part => {
            const span = document.createElement('span');
            span.className = part.className;
            span.innerText = part.text;
            lineDiv.appendChild(span);
        });
        container.appendChild(lineDiv);
    }

    hasContent() {
        return this.parts.some(part => part.text !== '');
    }
}
class SplitWindow {
    constructor() {
        this.leftLines = [];
        this.rightLines = [];
        this.leftLineNumbers = [];
        this.rightLineNumbers = [];
        this.currentLeftLine = new Line();
        this.currentRightLine = new Line();
        this.currentLeftLineNumber = new Line();
        this.currentRightLineNumber = new Line();
        this.leftIndex = 0;
        this.rightIndex = 0;
        this.leftLineContentFound = false;
        this.rightLineContentFound = false;
    }

    addRemovedText(part) {
        this.currentLeftLine.addPart(part, 'removed');
        this.currentRightLine.addPart('', 'match');
        this.leftLineContentFound = true;
    }

    addMatchingText(part) {
        this.currentLeftLine.addPart(part, 'match');
        this.currentRightLine.addPart(part, 'match');
        this.leftLineContentFound = true;
        this.rightLineContentFound = true;
    }

    addAddedText(part) {
        this.currentLeftLine.addPart('', 'match');
        this.currentRightLine.addPart(part, 'added');
        this.rightLineContentFound = true;
    }

    closeLine() {
        this.leftLines.push(this.currentLeftLine);
        this.rightLines.push(this.currentRightLine);

        if (this.leftLineContentFound) {
            this.currentLeftLineNumber.addPart((this.leftIndex + 1).toString(), 'match');
            this.leftIndex++;
        } else {
            this.currentLeftLineNumber.addPart('', 'match');
        }

        if (this.rightLineContentFound) {
            this.currentRightLineNumber.addPart((this.rightIndex + 1).toString(), 'match');
            this.rightIndex++;
        } else {
            this.currentRightLineNumber.addPart('', 'match');
        }

        this.leftLineNumbers.push(this.currentLeftLineNumber);
        this.rightLineNumbers.push(this.currentRightLineNumber);

        this.currentLeftLine = new Line();
        this.currentRightLine = new Line();
        this.currentLeftLineNumber = new Line();
        this.currentRightLineNumber = new Line();
        this.leftLineContentFound = false;
        this.rightLineContentFound = false;
    }

    render(leftContainer, rightContainer, leftLineNumbersContainer, rightLineNumbersContainer) {
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';
        leftLineNumbersContainer.innerHTML = '';
        rightLineNumbersContainer.innerHTML = '';

        for (let i = 0; i < this.leftLines.length; i++) {
            this.leftLines[i].render(leftContainer);
            this.rightLines[i].render(rightContainer);
            this.leftLineNumbers[i].render(leftLineNumbersContainer);
            this.rightLineNumbers[i].render(rightLineNumbersContainer);
        }
    }
}
class CombinedWindow {
    constructor() {
        this.lines = [];
        this.lineNumbers = [];
        this.currentLine = new Line();
        this.currentLineNumber = new Line();
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
        this.currentLineNumber.addPart((this.index + 1).toString(), 'match');
        this.lineNumbers.push(this.currentLineNumber);
        this.index++;
        this.currentLine = new Line();
        this.currentLineNumber = new Line();
    }

    render(container, lineNumbersContainer) {
        container.innerHTML = '';
        lineNumbersContainer.innerHTML = '';

        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].render(container);
            this.lineNumbers[i].render(lineNumbersContainer);
        }
    }
}
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
                return line === "" ? [] : [line];  // Each line is an entry
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

    processArrays(arr1, arr2) {
        let resultIndexes = [];
        let i = 0, j = 0;

        while (i < arr1.length && j < arr2.length) {
            if (arr2[arr1[i]] === i && arr1[arr2[j]] === j) {
                resultIndexes.push(['match', i, arr1[i]]);
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
        if (windowType === 'SplitWindow') {
            resultWindow = new SplitWindow();
        } else if (windowType === 'CombinedWindow') {
            resultWindow = new CombinedWindow();
        } else {
            throw new Error("Invalid windowType. Use 'SplitWindow' or 'CombinedWindow'.");
        }

        const resultConditions = this.processArrays(matchingLines1, matchingLines2);

        resultConditions.forEach(([status, origIndex, updIndex]) => {
            console.log(status, origIndex, updIndex);
            if (status === 'match') {
                const originalLine = originalData[origIndex];
                const updatedLine = updatedData[updIndex];
                const innerDp = this.findLCS(originalLine, updatedLine);
                const { matchingLines1: innerMatchingLines1, matchingLines2: innerMatchingLines2 } = this.traceBackLCS(originalLine, updatedLine, innerDp);
                const innerResults = this.processArrays(innerMatchingLines1, innerMatchingLines2);

                innerResults.forEach(([innerStatus, innerOrigIndex, innerUpdIndex]) => {
                    const originalPart = innerOrigIndex !== -1 ? originalLine[innerOrigIndex] : '';
                    const updatedPart = innerUpdIndex !== -1 ? updatedLine[innerUpdIndex] : '';

                    if (innerStatus === 'match') {
                        resultWindow.addMatchingText(originalPart);
                    } else if (innerStatus === 'remove') {
                        resultWindow.addRemovedText(originalPart);
                    } else if (innerStatus === 'added') {
                        resultWindow.addAddedText(updatedPart);
                    }
                });

                resultWindow.closeLine();
            } else if (status === 'remove') {
                const originalLine = originalData[origIndex].join('');
                resultWindow.addRemovedText(originalLine);
                resultWindow.closeLine();
            } else if (status === 'added') {
                const updatedLine = updatedData[updIndex].join('');
                resultWindow.addAddedText(updatedLine);
                resultWindow.closeLine();
            }
        });

        const leftContainer = document.getElementById('result-left');
        const rightContainer = document.getElementById('result-right');
        const leftLineNumbersContainer = document.getElementById('line-numbers-left');
        const rightLineNumbersContainer = document.getElementById('line-numbers-right');
        this.syncScroll([leftContainer, rightContainer, leftLineNumbersContainer, rightLineNumbersContainer]);
        resultWindow.render(leftContainer, rightContainer, leftLineNumbersContainer, rightLineNumbersContainer);
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

const diffChecker = new DiffChecker();
