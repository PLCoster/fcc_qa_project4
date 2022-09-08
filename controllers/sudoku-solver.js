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

  checkRowPlacement(puzzleString, row, column, value) {}

  checkColPlacement(puzzleString, row, column, value) {}

  checkRegionPlacement(puzzleString, row, column, value) {}

  solve(puzzleString) {}
}

module.exports = SudokuSolver;
