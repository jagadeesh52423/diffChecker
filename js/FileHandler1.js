class FileHandler {
    constructor() {
        this.initializeFileLoading();
    }

    initializeFileLoading() {
        const originalDropZone = document.getElementById('original-drop-zone');
        const updatedDropZone = document.getElementById('updated-drop-zone');
        const originalFileInput = document.getElementById('originalFile');
        const updatedFileInput = document.getElementById('updatedFile');

        this.setupDropZone(originalDropZone, originalFileInput, 'original');
        this.setupDropZone(updatedDropZone, updatedFileInput, 'updated');
    }

    setupDropZone(dropZone, fileInput, textareaId) {
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
            this.handleFileSelect(file, textareaId);
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            this.handleFileSelect(file, textareaId);
        });
    }

    handleFileSelect(file, textareaId) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById(textareaId).value = e.target.result;
            };
            reader.readAsText(file);
        }
    }

    saveLastFile(fileType, content) {
        localStorage.setItem(`lastFile_${fileType}`, JSON.stringify(content));
    }

    loadLastFile(fileType) {
        const content = localStorage.getItem(`lastFile_${fileType}`);
        if (content) {
            const parsedContent = JSON.parse(content);
            const textarea = document.getElementById(fileType);
            if (textarea) {
                textarea.value = parsedContent.map(line => line.join('')).join('\n');
            }
        } else {
            alert(`No previous ${fileType} file found.`);
        }
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
}

export default FileHandler;