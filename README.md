# Free Code Camp: Quality Assurance Project 4 - Sudoku Solver

## Sudoku Solver

The aim of this project was to build a small web app with functionality similar to: https://sudoku-solver.freecodecamp.rocks

The project was built using the following technologies:

- **HTML**
- **JavaScript** with **[Node.js](https://nodejs.org/en/) / [NPM](https://www.npmjs.com/)** for package management.
- **[Express](https://expressjs.com/)** web framework to build the web API.
- **[Bootstrap](https://getbootstrap.com/)** for styling with some custom **CSS**.
- **[FontAwesome](https://fontawesome.com/)** for icons.
- **[Mocha](https://mochajs.org/)** test framework with **[Chai](https://www.chaijs.com/)** assertions for testing.
- **[nodemon](https://nodemon.io/)** for automatic restarting of server during development.

### Project Requirements:

- **User Story #1:** You can `POST /api/solve` with form data containing `puzzle` which will be a string containing a combination of numbers (`1-9`) and periods `.` to represent empty spaces. The returned object will contain a `solution` property with the solved puzzle.

- **User Story #2:** If the object submitted to `/api/solve` is missing `puzzle`, the returned value will be `{ error: 'Required field missing' }`

- **User Story #3:** If the puzzle submitted to `/api/solve` contains values which are not numbers or periods, the returned value will be `{ error: 'Invalid characters in puzzle' }`

- **User Story #4:** If the puzzle submitted to `/api/solve` is greater or less than 81 characters, the returned value will be `{ error: 'Expected puzzle to be 81 characters long' }`

- **User Story #5:** If the puzzle submitted to `/api/solve` is invalid or cannot be solved, the returned value will be `{ error: 'Puzzle cannot be solved' }`

- **User Story #6:** You can `POST` to `/api/check` an object containing `puzzle`, `coordinate`, and `value` where the `coordinate` is the letter A-I indicating the row, followed by a number 1-9 indicating the column, and `value` is a number from 1-9.

- **User Story #7:** The return value from the `POST` to `/api/check` will be an object containing a `valid` property, which is `true` if the number may be placed at the provided coordinate and `false` if the number may not. If false, the returned object will also contain a `conflict` property which is an array containing the strings `"row"`, `"column"`, and/or `"region"` depending on which makes the placement invalid.

- **User Story #8:** If `value` submitted to `/api/check` is already placed in `puzzle` on that `coordinate`, the returned value will be an object containing a `valid` property with `true` if value is not conflicting.

- **User Story #9:** If the puzzle submitted to `/api/check` contains values which are not numbers or periods, the returned value will be `{ error: 'Invalid characters in puzzle' }`

- **User Story #10:** If the puzzle submitted to `/api/check` is greater or less than 81 characters, the returned value will be `{ error: 'Expected puzzle to be 81 characters long' }`

- **User Story #11:** If the object submitted to `/api/check` is missing `puzzle`, `coordinate` or `value`, the returned value will be `{ error: 'Required field(s) missing' }`

- **User Story #12:** If the coordinate submitted to `api/check` does not point to an existing grid cell, the returned value will be `{ error: 'Invalid coordinate'}`

- **User Story #13:** If the value submitted to `/api/check` is not a number between 1 and 9, the returned value will be `{ error: 'Invalid value' }`

- **User Story #14:** All 12 of the following unit tests for the SudokuSolver class are complete and passing:

  - `SudokuSolver.validate` handles a valid puzzle string of 81 characters.
  - `SudokuSolver.validate` handles a puzzle string with invalid characters (not 1-9 or .)
  - `SudokuSolver.validate` handles a puzzle string that is not 81 characters in length
  - `SudokuSolver.checkRowPlacement` handles a valid Row placement
  - `SudokuSolver.checkRowPlacement` handles an invalid Row placement
  - `SudokuSolver.checkColPlacement` handles a valid Col placement
  - `SudokuSolver.checkColPlacement` handles an invalid Col placement
  - `SudokuSolver.checkRegionPlacement` handles a valid Region (3x3 grid) placement
  - `SudokuSolver.checkRegionPlacement` handles an invalid Region placement
  - `SudokuSolver.solve` can solve a valid puzzle string and return the solution
  - `SudokuSolver.solve` returns an error for an unsolvable puzzle string
  - `SudokuSolver.solve` returns the correct solution when solving an incomplete puzzle.

- **User Story #15:** All 14 of the following functional tests for API routes are complete and passing:
  - Solve a puzzle with valid puzzle string: POST request to `/api/solve`
  - Solve a puzzle with missing puzzle string: POST request to `/api/solve`
  - Solve a puzzle with invalid characters: POST request to `/api/solve`
  - Solve a puzzle with incorrect length: POST request to `/api/solve`
  - Solve a puzzle that cannot be solved: POST request to `/api/solve`
  - Check a puzzle placement with all fields: POST request to `/api/check`
  - Check a puzzle placement with single placement conflict: POST request to `/api/check`
  - Check a puzzle placement with multiple placement conflicts: POST request to `/api/check`
  - Check a puzzle placement with all placement conflicts: POST request to `/api/check`
  - Check a puzzle placement with missing required fields: POST request to `/api/check`
  - Check a puzzle placement with invalid characters: POST request to `/api/check`
  - Check a puzzle placement with incorrect length: POST request to `/api/check`
  - Check a puzzle placement with invalid placement coordinate: POST request to `/api/check`
  - Check a puzzle placement with invalid placement value: POST request to `/api/check`

### Project Writeup:

The fourth Free Code Camp: Quality Assurance Project is a Sudoku Solver App and API. Sudokus are solved using a backtracking search algorithm, optimised by prioritising filling tiles with the least valid options remaining first. App and API users can:

- Request the solution of a sudoku puzzle by submitting the 'Solve Sudoku' form on the app homepage with a valid `puzzle` string, or by sending a POST request to `/api/solve` with a body containing a url encoded `puzzle` field (valid puzzle is 81 chars '1' to '9' or '.' to denote a blank tile).

- Request checking the validity of a move against an existing puzzle, by submitting the 'Check a Move' form on the app homepage, or by sending a POST request to `/api/check` with a body containing url encoded fields of `puzzle` (valid puzzle string), `coordinate` ('A1' - 'I9') and `value` ('1' to '9').

Two test suites have been written for the app:

- `tests/1_unit-tests.js` contains unit tests for the `SudokuSolver` class.
- `tests/2_functional-tests.js` contains functional tests of the application API routes (`/api/solve` and `/api/check`) with a variety of valid and invalid inputs.

Going beyond the required User Stories, the front-end of the app has been expanded to allow users to directly enter values into the sudoku grid. These moves are checked for validity as they are entered, and are flagged in red if they conflict with values already in the grid.

In addition, users can generate a random, solvable sudoku with a specified number of initial clues, by pressing the 'Generate Sudoku' button.

### Project Files

- `server.js` - the main entry point of the application, an express web server handling the routes defined in the specification.

- `/routes/api.js` - contains the major API routes for the express web app.

- `/controllers` - contains the `SudokuSolver` class with methods to aid solving and checking valid moves for sudokus, and a file containing some valid unsolved sudoku puzzle strings alongside their solutions, for testing purposes.

- `public/` - contains static files for the web app (stylesheet, logo, favicons etc), served by express using `express.static()`.

  - `index.js` contains functions for handling updates to the UI view of the app, and is loaded by `index.html`.

- `views/` - contains the single html page for the web app, `index.html`, which is served by express on `GET` requests to `/`

- `tests/` - contains the test suite for the application.

### Usage:

Requires Node.js / NPM in order to install required packages. After downloading the repo, install required dependencies with:

`npm install`

A development mode (with auto server restart on file save), can be started with:

`npm run dev`

The application can then be viewed at `http://localhost:3000/` in the browser.

To start the server without auto-restart on file save:

`npm start`

# Sudoku Solver BoilerPlate

The initial boilerplate for this app can be found at https://github.com/freecodecamp/boilerplate-project-sudoku-solver

Instructions for building the project can be found at https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/sudoku-solver
