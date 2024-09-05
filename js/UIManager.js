class UIManager {
    initializeFileLoading(loadOriginal, loadUpdated) {
        const originalLoadButton = document.getElementById('load-original');
        const updatedLoadButton = document.getElementById('load-updated');

        if (originalLoadButton) {
            originalLoadButton.addEventListener('click', loadOriginal);
        }
        if (updatedLoadButton) {
            updatedLoadButton.addEventListener('click', loadUpdated);
        }
    }

    escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

export default UIManager;