const visualizer = document.getElementById('visualizer');
const algorithmSelect = document.getElementById('algorithm');
const elementCountInput = document.getElementById('elementCount');
const speedInput = document.getElementById('speed');
const statsDiv = document.getElementById('stats');
const timeComplexityDiv = document.getElementById('timeComplexity');
const algorithmInfoDiv = document.getElementById('algorithmInfo');
const pauseResumeButton = document.getElementById('pauseResume');
let bars = [];
let sorting = false;
let paused = false;
let comparisons = 0;
let swaps = 0;
let startTime;

const timeComplexities = {
    bubble: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    selection: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    insertion: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    quick: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    merge: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    heap: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }
};

const algorithmDescriptions = {
    bubble: "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    selection: "Selection Sort divides the input list into two parts: a sorted portion at the left end and an unsorted portion at the right end.",
    insertion: "Insertion Sort builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.",
    quick: "Quick Sort is an efficient, recursive divide-and-conquer approach to sorting an array. It works by selecting a 'pivot' element and partitioning the other elements into two sub-arrays.",
    merge: "Merge Sort is an efficient, stable sorting algorithm that makes use of the divide and conquer strategy. It works by dividing the unsorted list into n sublists, each containing one element, then repeatedly merges sublists to produce new sorted sublists.",
    heap: "Heap Sort is a comparison-based sorting technique based on Binary Heap data structure. It is similar to selection sort where we first find the minimum element and place the minimum element at the beginning."
};

function generateBars() {
    if (sorting) return;
    const numBars = parseInt(elementCountInput.value);
    visualizer.innerHTML = '';
    bars = [];
    for (let i = 0; i < numBars; i++) {
        const height = Math.floor(Math.random() * 250) + 50;
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${height}px`;
        visualizer.appendChild(bar);
        bars.push(height);
    }
    updateStats();
    updateAlgorithmInfo();
}

function updateStats() {
    const elapsedTime = startTime ? (new Date() - startTime) / 1000 : 0;
    statsDiv.innerHTML = `Comparisons: ${comparisons} | Swaps: ${swaps} | Time: ${elapsedTime.toFixed(2)}s`;
}

function updateTimeComplexity() {
    const algorithm = algorithmSelect.value;
    const complexity = timeComplexities[algorithm];
    timeComplexityDiv.innerHTML = `Time Complexity - Best: ${complexity.best} | Average: ${complexity.average} | Worst: ${complexity.worst}`;
}

function updateAlgorithmInfo() {
    const algorithm = algorithmSelect.value;
    algorithmInfoDiv.innerHTML = `<strong>${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort:</strong> ${algorithmDescriptions[algorithm]}`;
}

async function startSort() {
    if (sorting) return;
    sorting = true;
    paused = false;
    comparisons = 0;
    swaps = 0;
    startTime = new Date();
    pauseResumeButton.textContent = 'Pause';
    const algorithm = algorithmSelect.value;
    updateTimeComplexity();
    updateAlgorithmInfo();
    switch (algorithm) {
        case 'bubble': await bubbleSort(); break;
        case 'selection': await selectionSort(); break;
        case 'insertion': await insertionSort(); break;
        case 'quick': await quickSort(0, bars.length - 1); break;
        case 'merge': await mergeSort(0, bars.length - 1); break;
        case 'heap': await heapSort(); break;
    }
    sorting = false;
    updatePerformanceChart();
}

function getDelay() {
    return (101 - parseInt(speedInput.value)) * 2;
}

async function swap(i, j) {
    while (paused) await sleep(100);
    await sleep(getDelay());
    let temp = bars[i];
    bars[i] = bars[j];
    bars[j] = temp;
    visualizer.children[i].style.height = `${bars[i]}px`;
    visualizer.children[j].style.height = `${bars[j]}px`;
    swaps++;
    updateStats();
}

async function compare(i, j) {
    while (paused) await sleep(100);
    await sleep(getDelay() / 2);
    visualizer.children[i].style.backgroundColor = '#e74c3c';
    visualizer.children[j].style.backgroundColor = '#e74c3c';
    await sleep(getDelay() / 2);
    visualizer.children[i].style.backgroundColor = '#3498db';
    visualizer.children[j].style.backgroundColor = '#3498db';
    comparisons++;
    updateStats();
    return bars[i] - bars[j];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bubbleSort() {
    const n = bars.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (await compare(j, j + 1) > 0) {
                await swap(j, j + 1);
            }
        }
    }
}

async function selectionSort() {
    const n = bars.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (await compare(j, minIdx) < 0) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            await swap(i, minIdx);
        }
    }
}

async function insertionSort() {
    const n = bars.length;
    for (let i = 1; i < n; i++) {
        let key = bars[i];
        let j = i - 1;
        while (j >= 0 && await compare(j, i) > 0) {
            await swap(j + 1, j);
            j--;
        }
        bars[j + 1] = key;
    }
}

async function quickSort(low, high) {
    if (low < high) {
        let pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    }
}

async function partition(low, high) {
    let pivot = bars[high];
    let i = low - 1;
    for (let j = low; j <= high - 1; j++) {
        if (await compare(j, high) < 0) {
            i++;
            await swap(i, j);
        }
    }
    await swap(i + 1, high);
    return i + 1;
}

async function mergeSort(left, right) {
    if (left < right) {
        let mid = Math.floor((left + right) / 2);
        await mergeSort(left, mid);
        await mergeSort(mid + 1, right);
        await merge(left, mid, right);
    }
}

async function merge(left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;
    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = bars[left + i];
    for (let j = 0; j < n2; j++) R[j] = bars[mid + 1 + j];

    let i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            bars[k] = L[i];
            i++;
        } else {
            bars[k] = R[j];
            j++;
        }
        visualizer.children[k].style.height = `${bars[k]}px`;
        await sleep(getDelay());
        k++;
    }

    while (i < n1) {
        bars[k] = L[i];
        visualizer.children[k].style.height = `${bars[k]}px`;
        await sleep(getDelay());
        i++;
        k++;
    }

    while (j < n2) {
        bars[k] = R[j];
        visualizer.children[k].style.height = `${bars[k]}px`;
        await sleep(getDelay());
        j++;
        k++;
    }
}

async function heapSort() {
    const n = bars.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i);
    }
    for (let i = n - 1; i > 0; i--) {
        await swap(0, i);
        await heapify(i, 0);
    }
}

async function heapify(n, i) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if (left < n && await compare(left, largest) > 0) {
        largest = left;
    }

    if (right < n && await compare(right, largest) > 0) {
        largest = right;
    }

    if (largest !== i) {
        await swap(i, largest);
        await heapify(n, largest);
    }
}

function openCustomArrayModal() {
    document.getElementById('customArrayModal').style.display = 'block';
}

function closeCustomArrayModal() {
    document.getElementById('customArrayModal').style.display = 'none';
}

function applyCustomArray() {
    const customArray = document.getElementById('customArrayInput').value;
    bars = customArray.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    generateBars();
    closeCustomArrayModal();
}

function pauseResumeSorting() {
    paused = !paused;
    pauseResumeButton.textContent = paused ? 'Resume' : 'Pause';
}

function stepSort() {
    if (sorting && !paused) {
        // Implement step-by-step sorting logic here
        alert("Step sorting is not yet implemented.");
    }
}

function updatePerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Comparisons', 'Swaps'],
            datasets: [{
                label: 'Sorting Performance',
                data: [comparisons, swaps],
                backgroundColor: ['#3498db', '#2ecc71'],
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('customArrayModal');
    if (event.target === modal) {
        closeCustomArrayModal();
    }
};