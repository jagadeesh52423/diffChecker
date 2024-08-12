document.getElementById('compare').addEventListener('click', function() {
    const originalText = document.getElementById('original').value;
    const updatedText = document.getElementById('updated').value;
    const comparisonType = document.getElementById('comparisonType').value || 'word'; // Default to Word
    const windowType = document.getElementById('windowType').value || 'CombinedWindow'; // Default to CombinedWindow

    const originalData = diffChecker.splitIntoDoubleDimensionalArray(originalText, comparisonType);
    const updatedData = diffChecker.splitIntoDoubleDimensionalArray(updatedText, comparisonType);
    const { matchingLines1, matchingLines2 } = diffChecker.diffChecker(originalData, updatedData);

    if (windowType === 'SplitWindow') {
        document.getElementById('result-left-container').style.display = 'flex';
        document.getElementById('result-right-container').style.display = 'flex';
        document.getElementById('result-center-container').style.display = 'none';

        diffChecker.displayResult(originalData, updatedData, matchingLines1, matchingLines2, 'SplitWindow');
    } else if (windowType === 'CombinedWindow') {
        document.getElementById('result-left-container').style.display = 'none';
        document.getElementById('result-right-container').style.display = 'none';
        document.getElementById('result-center-container').style.display = 'flex';

        diffChecker.displayResult(originalData, updatedData, matchingLines1, matchingLines2, 'CombinedWindow');
    }
});
