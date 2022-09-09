'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  const solver = new SudokuSolver();

  app.route('/api/check').post((req, res) => {});

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
