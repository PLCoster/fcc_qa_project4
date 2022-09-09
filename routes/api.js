'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  const solver = new SudokuSolver();

  app.route('/api/check').post((req, res) => {
    const { puzzle, coordinate, value } = req.body;

    if (
      [puzzle, coordinate, value].some((el) => el === '' || el === undefined)
    ) {
      return res.json({ error: 'Required field(s) missing' });
    }

    // Check that puzzle is valid before continuing:
    const [valid, error] = solver.validate(puzzle);

    if (!valid) {
      return res.json(error);
    }

    // Check value is valid:
    if (!/^[1-9]$/.test(value)) {
      return res.json({ error: 'Invalid value' });
    }

    // Check coordinate is valid:
    if (!/^[A-I][1-9]$/.test(coordinate)) {
      return res.json({ error: 'Invalid coordinate' });
    }

    // Check if placement is valid:
    const placementValidity = solver.checkPlacement(puzzle, coordinate, value);

    return res.json(placementValidity);
  });

  // POST request to /api/solve with puzzle field tries to solve puzzle
  // Returns solution if possible, otherwise an error
  app.route('/api/solve').post((req, res) => {
    const { puzzle } = req.body;

    if (!puzzle) {
      return res.json({ error: 'Required field missing' });
    }

    // Check puzzle is valid (length and characters) before trying to solve
    const [valid, error] = solver.validate(puzzle);

    if (!valid) {
      return res.json(error);
    }

    // Try to solve puzzle
    const solution = solver.solve(puzzle);

    if (!solution) {
      return res.json({ error: 'Puzzle cannot be solved' });
    }

    return res.json({ solution });
  });
};
