document.getElementById('compare').addEventListener('click', function() {
    const originalText = document.getElementById('original').value;
    const updatedText = document.getElementById('updated').value;
    const comparisonType = document.getElementById('comparisonType').value;
    const windowType = document.getElementById('windowType').value || 'SplitWindow'; // Default to SplitWindow

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

        // Render the result in the center container
        const centerContainer = document.getElementById('result-center');
        const centerLineNumbersContainer = document.getElementById('line-numbers-center');

        centerContainer.innerHTML = '';
        centerLineNumbersContainer.innerHTML = '';

        diffChecker.displayResult(originalData, updatedData, matchingLines1, matchingLines2, 'CombinedWindow');
    }
});
