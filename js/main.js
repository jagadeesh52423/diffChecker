let storedResults = null;
let currentWindowType = 'SplitWindow';
let previousOriginalText = '';
let previousUpdatedText = '';
let previousComparisonType = '';

document.getElementById('compare').addEventListener('click', () => {
    const originalText = document.getElementById('original').value;
    const updatedText = document.getElementById('updated').value;
    const comparisonType = document.getElementById('comparisonType').value;

    if (originalText !== previousOriginalText || updatedText !== previousUpdatedText || comparisonType !== previousComparisonType) {
        const originalData = diffChecker.splitIntoDoubleDimensionalArray(originalText, comparisonType);
        const updatedData = diffChecker.splitIntoDoubleDimensionalArray(updatedText, comparisonType);

        storedResults = diffChecker.diffChecker(originalData, updatedData);
        previousOriginalText = originalText;
        previousUpdatedText = updatedText;
        previousComparisonType = comparisonType;
    }

    currentWindowType = 'SplitWindow';
    diffChecker.displayResult(storedResults.originalData, storedResults.updatedData, storedResults.matchingLines1, storedResults.matchingLines2, currentWindowType);
});

document.getElementById('comparisonType').addEventListener('change', (event) => {
    const comparisonType = event.target.value;
    if (storedResults) {
        currentWindowType = comparisonType === 'combined' ? 'CombinedWindow' : 'SplitWindow';
        diffChecker.displayResult(storedResults.originalData, storedResults.updatedData, storedResults.matchingLines1, storedResults.matchingLines2, currentWindowType);
    }
});

