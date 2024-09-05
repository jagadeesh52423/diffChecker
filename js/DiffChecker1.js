import FileHandler from './FileHandler.js';
import LCSAlgorithm from './LCSAlgorithm.js';
import DiffProcessor from './DiffProcessor.js';
import ResultRenderer from './ResultRenderer.js';
import UIManager from './UIManager.js';

class DiffChecker {
    constructor() {
        this.fileHandler = new FileHandler();
        this.lcsAlgorithm = new LCSAlgorithm();
        this.diffProcessor = new DiffProcessor();
        this.resultRenderer = new ResultRenderer();
        this.uiManager = new UIManager();
    }

    initializeFileLoading() {
        // File loading is now handled in FileHandler constructor
        this.uiManager.initializeFileLoading(
            () => this.fileHandler.loadLastFile('original'),
            () => this.fileHandler.loadLastFile('updated')
        );
    }

    diffChecker(originalData, updatedData) {
        const dp = this.lcsAlgorithm.findLCSLines(originalData, updatedData);
        const { matchingLines1, matchingLines2 } = this.lcsAlgorithm.traceBackLCS(originalData, updatedData, dp);
        return { matchingLines1, matchingLines2, originalData, updatedData };
    }

    displayResult(originalData, updatedData, matchingLines1, matchingLines2, windowType) {
        this.fileHandler.saveLastFile('original', originalData);
        this.fileHandler.saveLastFile('updated', updatedData);

        const resultConditions = this.diffProcessor.processArrays(matchingLines1, matchingLines2, 'line');
        this.resultRenderer.displayResult(originalData, updatedData, resultConditions, windowType);
    }
}

export default DiffChecker;