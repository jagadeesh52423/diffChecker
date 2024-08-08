document.getElementById('originalFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('original').value = e.target.result;
        };
        reader.readAsText(file);
    }
});

document.getElementById('updatedFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('updated').value = e.target.result;
        };
        reader.readAsText(file);
    }
});
