const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const solver = new Solver();

const puzzlesAndSolutions = require('../controllers/puzzle-strings');

suite('Unit Tests', () => {
  suite('SudokuSolver.validate Tests', () => {
    test('SudokuSolver.validate validates valid puzzleStrings', () => {
      let valid, err;

      [valid, err] = solver.validate('.'.repeat(81));
      assert.isTrue(valid, 'puzzleString should be validated');
      assert.deepEqual(err, {}, 'No error should be returned');

      [valid, err] = solver.validate(
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
      );
      assert.isTrue(valid, 'puzzleString should be validated');
      assert.deepEqual(err, {}, 'No error should be returned');

      for (const [puzzleStr, solution] of puzzlesAndSolutions) {
        [valid, err] = solver.validate(puzzleStr);
        assert.isTrue(valid, 'puzzleString should be validated');
        assert.deepEqual(err, {}, 'No error should be returned');
      }
    });

    test('SudokuSolver.validate returns length error when puzzleString has wrong length ', () => {
      const expectedError = {
        error: 'Expected puzzle to be 81 characters long',
      };
      let valid, err;

      [valid, err] = solver.validate('.');
      assert.isFalse(valid, 'puzzleString is not valid');
      assert.deepEqual(
        err,
        expectedError,
        'Incorrect puzzle length error should be returned',
      );

      [valid, err] = solver.validate('.1234'.repeat(16)); // 80 characters
      assert.isFalse(valid, 'puzzleString is not valid');
      assert.deepEqual(
        err,
        expectedError,
        'Incorrect puzzle length error should be returned',
      );

      [valid, err] = solver.validate('.1234'.repeat(16) + '12'); // 82 characters
      assert.isFalse(valid, 'puzzleString is not valid');
      assert.deepEqual(
        err,
        expectedError,
        'Incorrect puzzle length error should be returned',
      );

      [valid, err] = solver.validate('.123d'.repeat(16) + 'ab'); // 82 characters, with some invalid characters
      assert.isFalse(valid, 'puzzleString is not valid');
      assert.deepEqual(
        err,
        expectedError,
        'Incorrect puzzle length error should be returned',
      );
    });

    test('SudokuSolver.validate returns character error when puzzleString has correct length but invalid characters ', () => {
      const expectedError = {
        error: 'Invalid characters in puzzle',
      };
      let valid, err;

      [valid, err] = solver.validate('a'.repeat(81));
      assert.isFalse(valid, 'puzzleString is not valid');
      assert.deepEqual(
        err,
        expectedError,
        'Invalid puzzle characters error should be returned',
      );

      [valid, err] = solver.validate('.'.repeat(80) + '0');
      assert.isFalse(valid, 'puzzleString is not valid');
      assert.deepEqual(
        err,
        expectedError,
        'Invalid puzzle characters error should be returned',
      );
    });
  });

  suite('SudokuSolver.checkRowPlacement Tests', () => {
    test('SudokuSolver.checkRowPlacement returns true for valid row placements', () => {
      const puzzleStr =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      let result;

      result = solver.checkRowPlacement(puzzleStr, 0, 0, '7');
      assert.isTrue(result);

      result = solver.checkRowPlacement(puzzleStr, 4, 4, '4');
      assert.isTrue(result);

      result = solver.checkRowPlacement(puzzleStr, 7, 6, '8');
      assert.isTrue(result);

      // Test replacing existing value with valid value
      result = solver.checkRowPlacement(puzzleStr, 5, 8, '3');
      assert.isTrue(result);
    });

    test('SudokuSolver.checkRowPlacement returns false for invalid row placements', () => {
      const puzzleStr =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      let result;

      result = solver.checkRowPlacement(puzzleStr, 0, 8, '5');
      assert.isFalse(result);

      result = solver.checkRowPlacement(puzzleStr, 7, 4, '7');
      assert.isFalse(result);

      result = solver.checkRowPlacement(puzzleStr, 3, 6, '6');
      assert.isFalse(result);

      // Test replacing existing value with invalid value
      result = solver.checkRowPlacement(puzzleStr, 5, 8, '1');
      assert.isFalse(result);
    });
  });

  suite('SudokuSolver.checkColPlacement Tests', () => {
    test('SudokuSolver.checkColPlacement returns true for valid column placements', () => {
      const puzzleStr =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      let result;

      result = solver.checkColPlacement(puzzleStr, 0, 0, '7');
      assert.isTrue(result);

      result = solver.checkColPlacement(puzzleStr, 4, 4, '4');
      assert.isTrue(result);

      result = solver.checkColPlacement(puzzleStr, 7, 6, '8');

      // Test replacing existing value with valid value
      result = solver.checkColPlacement(puzzleStr, 5, 8, '5');
      assert.isTrue(result);
    });

    test('SudokuSolver.checkColPlacement returns false for invalid column placements', () => {
      const puzzleStr =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      let result;

      result = solver.checkColPlacement(puzzleStr, 2, 8, '2');
      assert.isFalse(result);

      result = solver.checkColPlacement(puzzleStr, 5, 5, '9');
      assert.isFalse(result);

      result = solver.checkColPlacement(puzzleStr, 8, 0, '5');
      assert.isFalse(result);

      // Test replacing existing value with invalid value
      result = solver.checkColPlacement(puzzleStr, 5, 8, '7');
      assert.isFalse(result);
    });
  });

  suite('SudokuSolver.checkRegionPlacement Tests', () => {
    test('SudokuSolver.checkRegionPlacement returns true for valid region placements', () => {
      const puzzleStr =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      let result;

      result = solver.checkRegionPlacement(puzzleStr, 0, 0, '7');
      assert.isTrue(result);

      result = solver.checkRegionPlacement(puzzleStr, 4, 4, '4');
      assert.isTrue(result);

      result = solver.checkRegionPlacement(puzzleStr, 7, 6, '8');

      // Test replacing existing value with valid value
      result = solver.checkRegionPlacement(puzzleStr, 5, 8, '5');
      assert.isTrue(result);
    });

    test('SudokuSolver.checkRegionPlacement returns false for invalid region placements', () => {
      const puzzleStr =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      let result;

      result = solver.checkRegionPlacement(puzzleStr, 0, 0, '2');
      assert.isFalse(result);

      result = solver.checkRegionPlacement(puzzleStr, 2, 5, '5');
      assert.isFalse(result);

      result = solver.checkRegionPlacement(puzzleStr, 8, 7, '7');
      assert.isFalse(result);

      // Test replacing existing value with invalid value
      result = solver.checkRegionPlacement(puzzleStr, 7, 5, '3');
      assert.isFalse(result);
    });
  });
});
