document.addEventListener('DOMContentLoaded', () => {
    const originalDropZone = document.getElementById('original-drop-zone');
    const updatedDropZone = document.getElementById('updated-drop-zone');
    const originalFileInput = document.getElementById('originalFile');
    const updatedFileInput = document.getElementById('updatedFile');

    function handleFileSelect(file, textareaId) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById(textareaId).value = e.target.result;
            };
            reader.readAsText(file);
        }
    }

    function setupDropZone(dropZone, fileInput, textareaId) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            handleFileSelect(file, textareaId);
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            handleFileSelect(file, textareaId);
        });
    }

    setupDropZone(originalDropZone, originalFileInput, 'original');
    setupDropZone(updatedDropZone, updatedFileInput, 'updated');
});