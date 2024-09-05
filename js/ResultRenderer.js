import SplitWindow from './SplitWindow.js';
import CombinedWindow from './CombinedWindow.js';

class ResultRenderer {
    displayResult(originalData, updatedData, resultConditions, windowType) {
        let resultWindow;
        let containers;

        if (windowType === 'SplitWindow') {
            resultWindow = new SplitWindow();
            containers = {
                left: document.getElementById('result-left-container'),
                right: document.getElementById('result-right-container')
            };
        } else if (windowType === 'CombinedWindow') {
            resultWindow = new CombinedWindow();
            containers = {
                center: document.getElementById('result-center-container')
            };
        } else {
            throw new Error("Invalid windowType. Use 'SplitWindow' or 'CombinedWindow'.");
        }

        // Show loading spinner
        document.querySelector('.loading-spinner').style.display = 'flex';

        // Use requestAnimationFrame to process results in chunks
        const chunkSize = 100;
        let index = 0;

        const processChunk = () => {
            const endIndex = Math.min(index + chunkSize, resultConditions.length);

            for (let i = index; i < endIndex; i++) {
                const [status, origIndex, updIndex] = resultConditions[i];
                if (status === 'match') {
                    const originalLine = originalData[origIndex];
                    const updatedLine = updatedData[updIndex];
                    resultWindow.addMatchingText(originalLine.join(''));
                } else if (status === 'remove') {
                    const originalLine = originalData[origIndex].join('');
                    resultWindow.addRemovedText(originalLine);
                } else if (status === 'added') {
                    const updatedLine = updatedData[updIndex].join('');
                    resultWindow.addAddedText(updatedLine);
                }
                resultWindow.closeLine();
            }

            index = endIndex;

            if (index < resultConditions.length) {
                requestAnimationFrame(processChunk);
            } else {
                // Rendering is complete
                if (windowType === 'SplitWindow') {
                    resultWindow.render(containers.left.querySelector('.result-view'), containers.right.querySelector('.result-view'));
                    this.syncScroll([containers.left, containers.right]);
                } else if (windowType === 'CombinedWindow') {
                    resultWindow.render(containers.center.querySelector('.result-view'));
                    this.syncScroll([containers.center]);
                }

                // Hide loading spinner
                document.querySelector('.loading-spinner').style.display = 'none';
            }
        };

        requestAnimationFrame(processChunk);
    }

    displayCounts(container, deletions, insertions, matches, modifications) {
        // Remove existing count divisions
        const existingCounts = container.querySelectorAll('.diff-counts');
        existingCounts.forEach(count => count.remove());

        const countsDiv = document.createElement('div');
        countsDiv.className = 'diff-counts';
        
        if (deletions > 0) {
            countsDiv.innerHTML += `<span class="count-deletions">Deletions: ${deletions}</span>`;
        }
        if (insertions > 0) {
            countsDiv.innerHTML += `<span class="count-insertions">Insertions: ${insertions}</span>`;
        }
        if (matches > 0) {
            countsDiv.innerHTML += `<span class="count-matches">Matches: ${matches}</span>`;
        }
        if (modifications > 0) {
            countsDiv.innerHTML += `<span class="count-modifications">Modifications: ${modifications}</span>`;
        }

        container.insertBefore(countsDiv, container.firstChild);
    }

    syncScroll(divs) {
        const onScroll = (scrolledDiv) => {
            divs.forEach(div => {
                if (div !== scrolledDiv) {
                    div.scrollTop = scrolledDiv.scrollTop;
                    div.scrollLeft = scrolledDiv.scrollLeft;
                }
            });
        };

        divs.forEach(div => {
            div.addEventListener('scroll', () => onScroll(div));
        });
    }
}

export default ResultRenderer;