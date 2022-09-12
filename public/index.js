// This script is loaded by index.html
const textArea = document.getElementById('text-input');
const coordInput = document.getElementById('coord');
const valInput = document.getElementById('val');
const puzzleStrErr = document.getElementById('puzzle-str-err');
const responseMsg = document.getElementById('response');

// Function that updates puzzle string in text input
// after typing numbers into sudoku grid
function updatePuzzleString() {
  const gridValues = [];
  document.querySelectorAll('.sudoku-input').forEach((inputEl) => {
    const val = inputEl.value === '' ? '.' : inputEl.value;
    gridValues.push(val);
  });
  textArea.value = gridValues.join('');
}

// Function that fills the sudoku grid based on the puzzle string
function fillPuzzle(data) {
  // Remove errors since this is only called in non-error state
  textArea.classList.remove('error');
  puzzleStrErr.innerHTML = '';

  // Fill Sudoku grid from puzzle string
  let len = data.length < 81 ? data.length : 81;
  for (let i = 0; i < len; i++) {
    let rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 9));
    let col = (i % 9) + 1;
    if (!data[i] || data[i] === '.') {
      document.querySelector(`.${rowLetter + col} .sudoku-input`).value = ' ';
      continue;
    }
    document.querySelector(`.${rowLetter + col} .sudoku-input`).value = data[i];
  }
  return;
}

// Function that generates a random sudoku with a specified number of clues:
async function generateSudoku() {
  document.querySelector('#random-sudoku-btn').disabled = true;
  const numClues = parseInt(document.querySelector('#num-clues').value);

  if (isNaN(numClues) || numClues < 17 || numClues > 81) {
    document.querySelector('#num-clues').reportValidity();
  }

  const puzzleArr = Array(81).fill('.');
  const numCounts = Array(9).fill(9);

  // First generate a random puzzle with 17 clues
  for (let i = 0; i < 17; i += 1) {
    let clueIndex = Math.floor(Math.random() * 81);

    while (puzzleArr[clueIndex] !== '.') {
      clueIndex = Math.floor(Math.random() * 81);
    }

    // Select a random number for this position:
    let clueValue = Math.floor(Math.random() * 9) + 1;

    while (
      !validClue(puzzleArr, clueIndex, clueValue) ||
      numCounts[clueValue - 1] === 0
    ) {
      clueValue = Math.floor(Math.random() * 9) + 1;
    }

    numCounts[clueValue - 1] -= 1;
    puzzleArr[clueIndex] = clueValue;
  }

  const body = { puzzle: puzzleArr.join('') };

  // Get Puzzle Solution via API
  const data = await fetch('/api/solve', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await data.json();

  // If generated puzzle cannot be solved, create a new one
  if (result.error) {
    await generateSudoku();
    return;
  }

  const solvedArr = result.solution.split('');

  // Remove numbers randomly until numClues are left
  for (let i = 0; i < 81 - numClues; i += 1) {
    let clueIndex = Math.floor(Math.random() * 81);

    while (solvedArr[clueIndex] === '.') {
      clueIndex = Math.floor(Math.random() * 81);
    }

    solvedArr[clueIndex] = '.';
  }

  const sudokuToSolve = solvedArr.join('');
  fillPuzzle(sudokuToSolve);
  textArea.value = sudokuToSolve;
  document.querySelector('#random-sudoku-btn').disabled = false;
}

// Function that determines whether a value can be placed without conflict
function validClue(puzzleArr, position, value) {
  const rowIndex = Math.floor(position / 9);
  const colIndex = position % 9;

  const regionRowIndex = Math.floor(rowIndex / 3) * 3;
  const regionColIndex = Math.floor(colIndex / 3) * 3;

  for (let i = 0; i < 9; i += 1) {
    // Check columns
    const rowCheck = rowIndex * 9 + i;
    const colCheck = i * 9 + colIndex;
    const regionCheck =
      (regionRowIndex + Math.floor(i / 3)) * 9 + regionColIndex + (i % 3);

    if (
      puzzleArr[rowCheck] === value ||
      puzzleArr[colCheck] === value ||
      puzzleArr[regionCheck === value]
    ) {
      return false;
    }
  }

  return true;
}

// Function to call API with textarea string asking for puzzle solution
async function getSolved() {
  const body = { puzzle: textArea.value };
  const data = await fetch('/api/solve', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const parsed = await data.json();

  // Update response with result or error
  if (parsed.error) {
    responseMsg.innerHTML = `<code class="error-message">${JSON.stringify(
      parsed,
      null,
      2,
    )}</code>`;
    return;
  }
  responseMsg.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`;
  fillPuzzle(parsed.solution);
  textArea.value = parsed.solution;
}

// Function to call API to check a single move on current puzzle string
async function getChecked() {
  const stuff = {
    puzzle: textArea.value,
    coordinate: coordInput.value,
    value: valInput.value,
  };
  const data = await fetch('/api/check', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    body: JSON.stringify(stuff),
  });
  const parsed = await data.json();

  if (parsed.error) {
    responseMsg.innerHTML = `<code class="error-message">${JSON.stringify(
      parsed,
      null,
      2,
    )}</code>`;
    return;
  }

  responseMsg.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Set up updating puzzle string on input to sudoku grid:
  document.querySelectorAll('.sudoku-input').forEach((inputEl) => {
    inputEl.addEventListener('keyup', (event) => {
      event.target.classList.remove('error');

      // If value is valid, update
      if (
        ['', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(
          event.target.value,
        )
      ) {
        updatePuzzleString();
        fillPuzzle(textArea.value);
      }

      const lastChar = event.target.value[event.target.value.length - 1];
      // Otherwise try to remove erroneous input
      if (
        ['', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(lastChar)
      ) {
        event.target.value = lastChar;
        updatePuzzleString();
        fillPuzzle(textArea.value);
      } else {
        console.log('whoops');
        event.target.value = '';
        updatePuzzleString();
        fillPuzzle(textArea.value);
      }
    });
  });

  // Set up on click random sudoku generation:
  document
    .querySelector('#random-sudoku-btn')
    .addEventListener('click', () => generateSudoku());

  // Load Example Sudoku Puzzle
  generateSudoku();

  // Update Sudoku grid when input into textarea
  textArea.addEventListener('input', () => {
    if (!/^[1-9\.]{81}$/.test(textArea.value)) {
      textArea.classList.add('error');
      puzzleStrErr.innerHTML = `<code class="error-message">Sudoku puzzle string is not valid (wrong length or invalid characters)</code>`;
    } else {
      fillPuzzle(textArea.value);
    }
  });

  // Setup Solve and Check form on click effects
  document.getElementById('solve-button').addEventListener('click', getSolved);
  document.getElementById('check-button').addEventListener('click', getChecked);
});
