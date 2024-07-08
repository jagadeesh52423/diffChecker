class Pair {
    constructor(str1, str2) {
        this.str1 = str1;
        this.str2 = str2;
    }

    equals(other) {
        return other instanceof Pair && this.str1 === other.str1 && this.str2 === other.str2;
    }

    hashCode() {
        return `${this.str1}|${this.str2}`;
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
                } else {
                    return line.split('');
                }
            } else if (splitBy === "word") {
                if (line === "") {
                    return [""];
                } else {
                    const regex = /([a-zA-Z0-9]+|\s|[^\w\s])/g;
                    return line.match(regex) || [];
                }
            } else if (splitBy === "line") {
                return [line];  // Each line is an entry
            } else {
                throw new Error("Invalid splitBy criterion. Use 'character', 'word', or 'line'.");
            }
        });
    }

    createKey(str1, str2) {
        return new Pair(str1, str2);
    }

    findLCS(text1, text2) {
        const m = text1.length;
        const n = text2.length;
        const key = this.createKey(text1, text2);

        if (this.memo.has(key)) {
            console.log("Memoized value found.", this.memo.get(key), "for key:", key);
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

    traceBackSegments(originalData, updatedData, matchingLines1) {
        const matchingSegments1 = Array.from({ length: originalData.length }, () => []);
        const matchingSegments2 = Array.from({ length: updatedData.length }, () => []);

        for (let i = 0; i < matchingLines1.length; i++) {
            if (matchingLines1[i] !== -1) {
                let dp = this.findLCS(originalData[i], updatedData[matchingLines1[i]]);
                let _i = originalData[i].length;
                let _j = updatedData[matchingLines1[i]].length;
                while (_i > 0 && _j > 0) {
                    if (originalData[i][_i - 1] === updatedData[matchingLines1[i]][_j - 1]) {
                        matchingSegments1[i].unshift(originalData[i][_i - 1]);
                        matchingSegments2[matchingLines1[i]].unshift(originalData[i][_i - 1]);
                        _i--;
                        _j--;
                    } else if (dp[_i - 1][_j] > dp[_i][_j - 1]) {
                        _i--;
                    } else {
                        _j--;
                    }
                }
            }
        }

        return { matchingSegments1, matchingSegments2 };
    }

    traceBackLines(data1, data2, dp) {
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
        const { matchingLines1, matchingLines2 } = this.traceBackLines(originalData, updatedData, dp);
        const { matchingSegments1, matchingSegments2 } = this.traceBackSegments(originalData, updatedData, matchingLines1);
        return { matchingLines1, matchingLines2, matchingSegments1, matchingSegments2, dp };
    }

    compareTexts() {
        const originalText = document.getElementById('original').value;
        const updatedText = document.getElementById('updated').value;
        const comparisonType = document.getElementById('comparisonType').value;
        const originalData = this.splitIntoDoubleDimensionalArray(originalText, comparisonType);
        const updatedData = this.splitIntoDoubleDimensionalArray(updatedText, comparisonType);

        const { matchingLines1, matchingLines2, matchingSegments1, matchingSegments2, dp } = this.diffChecker(originalData, updatedData);
        const resultConditions = this.processArrays(matchingLines1, matchingLines2);
        this.displayResult(originalData, updatedData, matchingSegments1, matchingSegments2, resultConditions, comparisonType);
    }

    processArrays(arr1, arr2) {
        let result = [];
        let maxLength = Math.max(arr1.length, arr2.length);
        let i = 0, j = 0;

        while (i < arr1.length && j < arr2.length) {
            if (arr2[arr1[i]] === i && arr1[arr2[j]] === j) {
                result.push(['match', i, arr1[i]]);
                i++;
                j++;
            } else if (arr1[i] === -1 && arr2[j] === -1) {
                result.push(['match', i, j]);
                i++;
                j++;
            } else if (arr1[i] === -1) {
                result.push(['remove', i, -1]);
                i++;
            } else if (arr2[j] === -1) {
                result.push(['added', -1, j]);
                j++;
            } else {
                console.log("Error in processing arrays.");
            }
        }

        while (i < arr1.length) {
            result.push(['remove', i, -1]);
            i++;
        }

        while (j < arr2.length) {
            result.push(['added', -1, j]);
            j++;
        }

        return result;
    }

    createSpanElement(text, className) {
        if (text === "") {
            text = "\n";
        }
        return `<span class="${className}">${text}</span>`;
    }

    displayResult(originalData, updatedData, matchingSegments1, matchingSegments2, resultConditions, comparisonType) {
        const resultContainer = document.getElementById('result-container');
        const resultLeftDiv = document.getElementById('result-left');
        const resultRightDiv = document.getElementById('result-right');
        const resultSingleDiv = document.getElementById('result-single');
        
        resultLeftDiv.innerHTML = '';
        resultRightDiv.innerHTML = '';
        resultSingleDiv.innerHTML = '';

        if (comparisonType === 'line') {
            resultLeftDiv.style.display = 'block';
            resultRightDiv.style.display = 'block';
            resultSingleDiv.style.display = 'none';
            
            resultConditions.forEach(condition => {
                const [status, origIndex, updIndex] = condition;
                const lineResultLeft = document.createElement('div');
                const lineResultRight = document.createElement('div');
                lineResultLeft.style.whiteSpace = 'pre'; // Ensure whitespace is preserved
                lineResultRight.style.whiteSpace = 'pre'; // Ensure whitespace is preserved

                if (status === 'match') {
                    const segment = originalData[origIndex].join('');
                    lineResultLeft.innerHTML = `<span class="match">${this.escapeHTML(segment)}</span>`;
                    lineResultRight.innerHTML = `<span class="match">${this.escapeHTML(segment)}</span>`;
                } else if (status === 'remove' && origIndex !== -1) {
                    let segment = originalData[origIndex].join('');
                    lineResultRight.innerHTML = `<span class=\"match\">\n</span>`; // Empty space for alignment
                    if (segment === "") {
                        segment = "\n";
                    }
                    lineResultLeft.innerHTML = `<span class="removed">${this.escapeHTML(segment)}</span>`;
                } else if (status === 'added' && updIndex !== -1) {
                    let segment = updatedData[updIndex].join('');
                    lineResultLeft.innerHTML = `<span class=\"match\">\n</span>`; // Empty space for alignment
                    if (segment === "") {
                        segment = "\n";
                    }
                    lineResultRight.innerHTML = `<span class="added">${this.escapeHTML(segment)}</span>`;
                }

                resultLeftDiv.appendChild(lineResultLeft);
                resultRightDiv.appendChild(lineResultRight);
            });

            // Synchronize scroll between left and right views
            this.syncScroll(resultLeftDiv, resultRightDiv);

        } else {
            resultLeftDiv.style.display = 'none';
            resultRightDiv.style.display = 'none';
            resultSingleDiv.style.display = 'block';

            resultConditions.forEach(condition => {
                const [status, origIndex, updIndex] = condition;
                const lineResult = document.createElement('div');
                lineResult.style.whiteSpace = 'pre'; // Ensure whitespace is preserved

                if (status === 'match') {
                    let currentStatus = 'match';
                    let currentString = '';
                    let originalIndex = 0;
                    let updatedIndex = 0;
                    let lcsIndex = 0;

                    while (originalIndex < originalData[origIndex].length || updatedIndex < updatedData[updIndex].length) {
                        if (originalIndex < originalData[origIndex].length && updatedIndex < updatedData[updIndex].length &&
                            matchingSegments1[origIndex][lcsIndex] &&
                            originalData[origIndex][originalIndex] === matchingSegments1[origIndex][lcsIndex] &&
                            updatedData[updIndex][updatedIndex] === matchingSegments1[origIndex][lcsIndex]) {

                            if (currentStatus !== 'match') {
                                if (currentString) {
                                    lineResult.innerHTML += this.createSpanElement(currentString, currentStatus);
                                }
                                currentStatus = 'match';
                                currentString = '';
                            }
                            currentString += matchingSegments1[origIndex][lcsIndex];
                            originalIndex++;
                            updatedIndex++;
                            lcsIndex++;
                        } else if (originalIndex < originalData[origIndex].length && (updatedIndex >= updatedData[updIndex].length || originalData[origIndex][originalIndex] !== matchingSegments1[origIndex][lcsIndex])) {
                            if (currentStatus !== 'removed') {
                                if (currentString) {
                                    lineResult.innerHTML += this.createSpanElement(currentString, currentStatus);
                                }
                                currentStatus = 'removed';
                                currentString = '';
                            }
                            currentString += originalData[origIndex][originalIndex];
                            originalIndex++;
                        } else if (updatedIndex < updatedData[updIndex].length) {
                            if (currentStatus !== 'added') {
                                if (currentString) {
                                    lineResult.innerHTML += this.createSpanElement(currentString, currentStatus);
                                }
                                currentStatus = 'added';
                                currentString = '';
                            }
                            currentString += updatedData[updIndex][updatedIndex];
                            updatedIndex++;
                        }
                    }

                    if (currentString) {
                        lineResult.innerHTML += this.createSpanElement(currentString, currentStatus);
                    }
                } else if (status === 'remove' && origIndex !== -1) {
                    const segment = originalData[origIndex].join('');
                    lineResult.innerHTML = this.createSpanElement(segment, 'removed');
                } else if (status === 'added' && updIndex !== -1) {
                    const segment = updatedData[updIndex].join('');
                    lineResult.innerHTML = this.createSpanElement(segment, 'added');
                }

                resultSingleDiv.appendChild(lineResult);
            });
        }
    }

    syncScroll(leftDiv, rightDiv) {
        leftDiv.onscroll = function() {
            rightDiv.scrollTop = leftDiv.scrollTop;
        };
        rightDiv.onscroll = function() {
            leftDiv.scrollTop = rightDiv.scrollTop;
        };
    }

    escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }
}
