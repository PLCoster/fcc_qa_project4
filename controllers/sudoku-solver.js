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

  solve(puzzleString) {}
}

module.exports = SudokuSolver;
