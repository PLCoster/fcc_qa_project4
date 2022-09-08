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

  // Checks if the given placement is valid in the current board
  checkRowPlacement(puzzleString, row, column, value) {
    const positionIndex = row * 9 + column - 1;

    // Check all row entries apart from the given position:
    for (let i = 0; i < 9; i += 1) {
      const checkPosition = row * 9 + i;
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

  checkColPlacement(puzzleString, row, column, value) {}

  checkRegionPlacement(puzzleString, row, column, value) {}

  solve(puzzleString) {}
}

module.exports = SudokuSolver;
