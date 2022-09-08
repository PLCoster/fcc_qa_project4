const rowCharToIndex = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
};

const validMovesArr = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

class SudokuSolver {
  // Determines if a given puzzleString is valid i.e.:
  // contains 81 characters from 1-9 or '.'
  // Returns an array with the first item boolean - whether puzzle is valid or not
  // If puzzle is not valid, the second item in the return array is an error object
  // NOTE: Does not check if number placements inside grid are valid or conflict
  validate(puzzleString) {
    if (puzzleString.length !== 81) {
      return [false, { error: 'Expected puzzle to be 81 characters long' }];
    }

    // Otherwise check that string only contains valid characters:
    if (!/[1-9\.]{81}/.test(puzzleString)) {
      return [false, { error: 'Invalid characters in puzzle' }];
    }

    return [true, {}];
  }

  // Checks if the given placement is valid for rows in the current board
  checkRowPlacement(puzzleString, row, column, value) {
    const positionIndex = row * 9 + column;

    // Check all row entries apart from the given position:
    for (let checkCol = 0; checkCol < 9; checkCol += 1) {
      const checkPosition = row * 9 + checkCol;

      if (
        checkPosition === positionIndex ||
        puzzleString[checkPosition] === '.'
      ) {
        continue;
      } else if (puzzleString[checkPosition] === value) {
        return false;
      }
    }

    return true;
  }

  // Checks if the given placement is valid for columns in the current board
  checkColPlacement(puzzleString, row, column, value) {
    const positionIndex = row * 9 + column;

    // Check all column entries apart from the given position:
    for (let checkRow = 0; checkRow < 9; checkRow += 1) {
      const checkPosition = checkRow * 9 + column;

      if (
        checkPosition === positionIndex ||
        puzzleString[checkPosition] === '.'
      ) {
        continue;
      } else if (puzzleString[checkPosition] === value) {
        return false;
      }
    }

    return true;
  }

  // Checks if the given placement is valid for regions in the current board
  checkRegionPlacement(puzzleString, row, column, value) {
    const positionIndex = row * 9 + column;

    const regionStartRow = Math.floor(row / 3) * 3;
    const regionStartCol = Math.floor(column / 3) * 3;

    for (
      let checkRow = regionStartRow;
      checkRow < regionStartRow + 3;
      checkRow += 1
    ) {
      for (
        let checkCol = regionStartCol;
        checkCol < regionStartCol + 3;
        checkCol += 1
      ) {
        const checkPosition = checkRow * 9 + checkCol;

        if (
          checkPosition === positionIndex ||
          puzzleString[checkPosition] === '.'
        ) {
          continue;
        } else if (puzzleString[checkPosition] === value) {
          return false;
        }
      }
    }

    return true;
  }

  // Checks a placement is valid along rows, columns and regions
  checkAll(puzzleString, row, column, value) {
    return (
      this.checkRowPlacement(puzzleString, row, column, value) &&
      this.checkColPlacement(puzzleString, row, column, value) &&
      this.checkRegionPlacement(puzzleString, row, column, value)
    );
  }

  // Public solve function that creates puzzle array and the solves
  solve(puzzleString) {
    const puzzleArray = puzzleString.split('');
    const remainingMoves = this.getRemainingMoves(puzzleArray);

    // If we have an empty tile with no valid moves, puzzle is not solvable
    if (this.emptyTileHasNoMoves(remainingMoves)) {
      return false;
    }

    return this.solvePuzzle(puzzleArray, remainingMoves);
  }

  // Attempts to solve the given sudoku using brute-force backtracking search
  // Optimises by placing values in the tile with fewest options remaining
  solvePuzzle(puzzleArray, remainingMoves) {
    // If no moves remain, check sudoku is solved
    if (Object.keys(remainingMoves).length === 0) {
      if (this.sudokuIsSolved(puzzleArray.join(''))) {
        return puzzleArray.join('');
      }

      // Otherwise we are unable to solve puzzle from this state
      return false;
    }

    // Otherwise try backtracking search on first empty space
    const [nextMoveIndex, moveSet] = Object.entries(remainingMoves).sort(
      (a, b) => a[1].size - b[1].size,
    )[0];

    const moveArr = Array.from(moveSet);

    // Try all possible values for this move:
    for (const value of moveArr) {
      const newRemainingMoves = this.updateRemainingMoves(
        nextMoveIndex,
        value,
        remainingMoves,
      );

      // If the move we have just made results in an empty tile having no moves available
      // then this move cannot be valid, skip it and move to next possible move for current tile
      if (this.emptyTileHasNoMoves(newRemainingMoves)) {
        continue;
      }

      puzzleArray[nextMoveIndex] = value;

      const result = this.solvePuzzle(puzzleArray, newRemainingMoves);
      if (result) return result;
    }

    // If we get here, current puzzleArray is not solvable
    // Reset most recent move and backtrack to previous move
    puzzleArray[nextMoveIndex] = '.';

    return false;
  }

  // Returns true if the puzzle is solved, otherwise false
  // Assumes that only valid moves have been placed on the sudoku
  sudokuIsSolved(puzzleString) {
    if (/[1-9]{81}/.test(puzzleString)) {
      return true;
    }
    return false;
  }

  getRemainingMoves(puzzleArray) {
    const remainingMoves = {};
    for (let index = 0; index < 81; index += 1) {
      remainingMoves[index] = new Set(validMovesArr);
    }

    // Remove no longer valid moves from remaining moves:
    for (let index = 0; index < 81; index += 1) {
      if (puzzleArray[index] !== '.') {
        const usedValue = puzzleArray[index];
        remainingMoves[index] = new Set();

        // Remove invalid moves from row, col region tiles:
        const rowIndex = Math.floor(index / 9);
        const colIndex = index - rowIndex * 9;

        const regionRowIndex = Math.floor(rowIndex / 3) * 3;
        const regionColIndex = Math.floor(colIndex / 3) * 3;

        // Remove value from all tiles on same row / column
        for (let i = 0; i < 9; i += 1) {
          // Rows
          const rowPosition = rowIndex * 9 + i;
          remainingMoves[rowPosition].delete(usedValue);
          // Columns
          const colPosition = i * 9 + colIndex;
          remainingMoves[colPosition].delete(usedValue);
          // Regions
          const regionPosition =
            (Math.floor(i / 3) + regionRowIndex) * 9 + (i % 3) + regionColIndex;
          remainingMoves[regionPosition].delete(usedValue);
        }
      }
    }

    // Return only indices that require a move to be placed
    return Object.keys(remainingMoves).reduce((accum, index) => {
      if (puzzleArray[index] === '.') {
        accum[index] = remainingMoves[index];
      }
      return accum;
    }, {});
  }

  // Function that creates a new remainingMoves object, applying
  // the given move
  updateRemainingMoves(nextMoveIndex, value, remainingMoves) {
    const newRemainingMoves = {};

    Object.keys(remainingMoves).forEach((index) => {
      if (index === nextMoveIndex) {
        return;
      }

      newRemainingMoves[index] = new Set(remainingMoves[index]);

      if (newRemainingMoves[index].has(value)) {
        // If index shares row column or tile with the nextMove, remove value from available moves
        const moveRow = Math.floor(nextMoveIndex / 9);
        const currRow = Math.floor(index / 9);

        const moveCol = nextMoveIndex % 9;
        const currCol = index % 9;

        const moveTile = Math.floor(moveRow / 3) * 3 + Math.floor(moveCol / 3);
        const currTile = Math.floor(currRow / 3) * 3 + Math.floor(currCol / 3);

        if (
          moveRow === currRow ||
          moveCol === currCol ||
          moveTile === currTile
        ) {
          newRemainingMoves[index].delete(value);
        }
      }
    });

    return newRemainingMoves;
  }

  // Return true if there is an index in the remainingMoves object with no moves remaining
  // This indicates that the puzzle is not solvable in its current state
  emptyTileHasNoMoves(remainingMoves) {
    const emptyTilePositions = Object.entries(remainingMoves).sort(
      (a, b) => a[1].size - b[1].size,
    );

    if (emptyTilePositions.length === 0) {
      // No moves left, but all tiles are filled - move is valid
      return false;
    }

    // Current puzzle has an empty tile with no possible moves - must backtrack
    return emptyTilePositions[0][1].size === 0;
  }
}

module.exports = SudokuSolver;
