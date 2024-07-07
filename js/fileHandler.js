// Handle file input and textarea updates
function handleFileInput(event, textareaId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const textarea = document.getElementById(textareaId);
            textarea.value = e.target.result;
        };
        reader.readAsText(file);
    }
}

document.getElementById('originalFile').addEventListener('change', (event) => handleFileInput(event, 'original'));
document.getElementById('updatedFile').addEventListener('change', (event) => handleFileInput(event, 'updated'));
