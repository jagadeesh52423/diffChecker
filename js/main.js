import DiffChecker from './DiffChecker.js';

function initializeDiffChecker() {
    const diffChecker = new DiffChecker();
    const compareButton = document.getElementById('compare');
    const comparisonTypeButtons = document.querySelectorAll('#comparisonType .toggle-button');
    const windowTypeButtons = document.querySelectorAll('#windowType .toggle-button');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Initialize file loading
    diffChecker.initializeFileLoading();

    // Event listeners for toggle buttons
    function setActiveButton(buttons, clickedButton) {
        buttons.forEach(button => button.classList.remove('active'));
        clickedButton.classList.add('active');
    }

    comparisonTypeButtons.forEach(button => {
        button.addEventListener('click', () => setActiveButton(comparisonTypeButtons, button));
    });

    windowTypeButtons.forEach(button => {
        button.addEventListener('click', () => setActiveButton(windowTypeButtons, button));
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Compare button click event
    compareButton.addEventListener('click', () => {
        const originalText = document.getElementById('original').value;
        const updatedText = document.getElementById('updated').value;

        if (originalText === '' || updatedText === '') {
            alert('Please enter both original and updated text before comparing.');
            return;
        }

        const comparisonType = document.querySelector('#comparisonType .toggle-button.active').dataset.value;
        const windowType = document.querySelector('#windowType .toggle-button.active').dataset.value;

        // Show loading spinner
        document.querySelector('.loading-spinner').style.display = 'flex';

        // Use setTimeout to allow the UI to update before starting the comparison
        setTimeout(() => {
            const originalData = diffChecker.fileHandler.splitIntoDoubleDimensionalArray(originalText, comparisonType);
            const updatedData = diffChecker.fileHandler.splitIntoDoubleDimensionalArray(updatedText, comparisonType);
            const { matchingLines1, matchingLines2 } = diffChecker.diffChecker(originalData, updatedData);

            if (windowType === 'SplitWindow') {
                document.getElementById('result-left-container').style.display = 'flex';
                document.getElementById('result-right-container').style.display = 'flex';
                document.getElementById('result-center-container').style.display = 'none';
            } else if (windowType === 'CombinedWindow') {
                document.getElementById('result-left-container').style.display = 'none';
                document.getElementById('result-right-container').style.display = 'none';
                document.getElementById('result-center-container').style.display = 'flex';
            }

            diffChecker.displayResult(originalData, updatedData, matchingLines1, matchingLines2, windowType);

            // Hide loading spinner
            document.querySelector('.loading-spinner').style.display = 'none';
        }, 0);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            compareButton.click();
        }
    });
}

// Call the initialization function after the page has loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDiffChecker);
} else {
    initializeDiffChecker();
}