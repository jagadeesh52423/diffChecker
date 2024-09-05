class DiffProcessor {
    processArrays(arr1, arr2, type) {
        let resultIndexes = [];
        let i = 0, j = 0;

        while (i < arr1.length && j < arr2.length) {
            if (arr2[arr1[i]] === i && arr1[arr2[j]] === j) {
                resultIndexes.push(['match', i, arr1[i]]);
                i++;
                j++;
            } else if (arr1[i] === -1 && arr2[j] === -1 && type === 'line') {
                resultIndexes.push(['match', i, j]);
                i++;
                j++;
            } else if (arr1[i] === -1) {
                resultIndexes.push(['remove', i, -1]);
                i++;
            } else if (arr2[j] === -1) {
                resultIndexes.push(['added', -1, j]);
                j++;
            } else {
                console.log("Error in processing arrays.");
            }
        }

        while (i < arr1.length) {
            resultIndexes.push(['remove', i, -1]);
            i++;
        }

        while (j < arr2.length) {
            resultIndexes.push(['added', -1, j]);
            j++;
        }

        return resultIndexes;
    }
}

export default DiffProcessor;