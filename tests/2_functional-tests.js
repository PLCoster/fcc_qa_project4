const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;

const server = require('../server');
const solvablePuzzles = require('../controllers/puzzle-strings');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('API Tests', () => {
    suite('POST /api/solve with puzzle string => solve sudoku puzzle', () => {
      test('Test POST /api/solve with valid puzzle string, returns solution', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const solution =
          '769235418851496372432178956174569283395842761628713549283657194516924837947381625';

        const puzzlesAndSolutions = solvablePuzzles.slice();
        puzzlesAndSolutions.push([puzzle, solution]);

        Promise.all(
          puzzlesAndSolutions.map(([puzzle, solution]) => {
            return chai.request(server).post('/api/solve').send({ puzzle });
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res, i) => {
              assert.equal(res.status, 200, 'Response status should be 200');
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.include(
                res.body,
                { solution: puzzlesAndSolutions[i][1] },
                'Response should contain solution property with correct solution string',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/solve with missing puzzle string, returns "field missing" error', (done) => {
        const expectedResponse = { error: 'Required field missing' };

        chai
          .request(server)
          .post('/api/solve')
          .send({})
          .then((res) => {
            assert.equal(res.status, 200, 'Response status should be 200'); // !!!
            assert.equal(
              res.type,
              'application/json',
              'Response type should be application/json',
            );
            assert.isObject(res.body, 'Response body should be an object');
            assert.include(
              res.body,
              expectedResponse,
              'Response should contain error property with "missing field" message',
            );

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/solve with a puzzle string containing invalid characters, returns "Invalid characters in puzzle" error', (done) => {
        const puzzle =
          '..9..5.1.85.a....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'; // contains 'a' character
        const expectedResponse = {
          error: 'Invalid characters in puzzle',
        };

        chai
          .request(server)
          .post('/api/solve')
          .send({ puzzle })
          .then((res) => {
            assert.equal(res.status, 200, 'Response status should be 200'); // !!!
            assert.equal(
              res.type,
              'application/json',
              'Response type should be application/json',
            );
            assert.isObject(res.body, 'Response body should be an object');
            assert.include(
              res.body,
              expectedResponse,
              'Response should contain error property with "Invalid characters" message',
            );

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/solve with a puzzle string containing less than or more than 81 characters, returns "Invalid Length" error', (done) => {
        const invalidPuzzleStrings = [
          '.',
          '.'.repeat(80),
          '.'.repeat(82),
          '.'.repeat(81) + 'a', // Length error overrides character error
        ];

        const expectedResponse = {
          error: 'Expected puzzle to be 81 characters long',
        };

        Promise.all(
          invalidPuzzleStrings.map((puzzle) => {
            return chai.request(server).post('/api/solve').send({ puzzle });
          }),
        )
          .then((responses) => {
            responses.forEach((res) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.include(
                res.body,
                expectedResponse,
                'Response should contain error property with "Invalid Length" message',
              );
            });
            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/solve with valid but unsolvable puzzle strings should return "cannot be solved" error', (done) => {
        const unsolvablePuzzleStrings = [
          '2.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
          '123..........4....789....4.......................................................',
          '123...............789...........4....6.....53..8...1...12...........7.........297',
          '887549163531672894649831527496157382218396475753284916962415738185763249374928651',
        ];

        const expectedResponse = {
          error: 'Puzzle cannot be solved',
        };

        Promise.all(
          unsolvablePuzzleStrings.map((puzzle) => {
            return chai.request(server).post('/api/solve').send({ puzzle });
          }),
        )
          .then((responses) => {
            responses.forEach((res) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.include(
                res.body,
                expectedResponse,
                'Response should contain error property with "Puzzle cannot be solved" message',
              );
            });
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  suite(
    'POST /api/check with puzzle, coordinate and value => check if move is valid',
    () => {
      test('Test POST /api/check with a valid placement and all fields', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';

        const validPlacements = [
          { puzzle, coordinate: 'A1', value: '7' },
          { puzzle, coordinate: 'A2', value: '7' },
          { puzzle, coordinate: 'A2', value: '6' },
          { puzzle, coordinate: 'A3', value: '9' }, // Check already placed number is valid
          { puzzle, coordinate: 'A9', value: '6' },
          { puzzle, coordinate: 'E5', value: '2' },
          { puzzle, coordinate: 'I1', value: '2' },
          { puzzle, coordinate: 'I8', value: '2' },
        ];

        const expectedResponse = { valid: true };

        Promise.all(
          validPlacements.map((body) => {
            return chai.request(server).post('/api/check').send(body);
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res) => {
              assert.equal(res.status, 200, 'Response status should be 200');
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.include(
                res.body,
                expectedResponse,
                'Response should contain valid property with value of true indicating move is valid',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/check with a placement with a single conflict and all fields', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';

        const placements = [
          { puzzle, coordinate: 'A5', value: '9' },
          { puzzle, coordinate: 'A1', value: '6' },
          { puzzle, coordinate: 'A5', value: '4' },
        ];

        const expectedResponses = [
          { valid: false, conflict: ['row'] },
          { valid: false, conflict: ['column'] },
          { valid: false, conflict: ['region'] },
        ];

        Promise.all(
          placements.map(({ puzzle, coordinate, value }) => {
            return chai
              .request(server)
              .post('/api/check')
              .send({ puzzle, coordinate, value });
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res, i) => {
              assert.equal(res.status, 200, 'Response status should be 200');
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.deepInclude(
                res.body,
                expectedResponses[i],
                'Response should contain valid property with value of false indicating move is invalid, and a conflict property indicating the conflict',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/check with a placement with two conflicts and all fields', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';

        const placements = [
          { puzzle, coordinate: 'A1', value: '9' },
          { puzzle, coordinate: 'A1', value: '1' },
          { puzzle, coordinate: 'A2', value: '3' },
        ];

        const expectedResponses = [
          { valid: false, conflict: ['row', 'region'] },
          { valid: false, conflict: ['row', 'column'] },
          { valid: false, conflict: ['column', 'region'] }, // !!!
        ];

        Promise.all(
          placements.map(({ puzzle, coordinate, value }) => {
            return chai
              .request(server)
              .post('/api/check')
              .send({ puzzle, coordinate, value });
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res, i) => {
              assert.equal(res.status, 200, 'Response status should be 200');
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.deepInclude(
                res.body,
                expectedResponses[i],
                'Response should contain valid property with value of false indicating move is invalid, and a conflict property indicating the conflict(s)',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/check with a placement with all conflicts and all fields', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';

        const placements = [
          { puzzle, coordinate: 'A2', value: '5' },
          { puzzle, coordinate: 'E6', value: '9' },
          { puzzle, coordinate: 'I9', value: '4' },
        ];

        const expectedResponses = [
          { valid: false, conflict: ['row', 'column', 'region'] },
          { valid: false, conflict: ['row', 'column', 'region'] },
          { valid: false, conflict: ['row', 'column', 'region'] },
        ];

        Promise.all(
          placements.map(({ puzzle, coordinate, value }) => {
            return chai
              .request(server)
              .post('/api/check')
              .send({ puzzle, coordinate, value });
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res, i) => {
              assert.equal(res.status, 200, 'Response status should be 200');
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.deepInclude(
                res.body,
                expectedResponses[i],
                'Response should contain valid property with value of false indicating move is invalid, and a conflict property indicating the conflict(s)',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/check with missing required fields returns a "required fields missing" error', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const coordinate = 'A1';
        const value = '7';

        const missingFieldBodies = [
          {},
          { puzzle },
          { coordinate },
          { value },
          { puzzle, coordinate },
          { puzzle, value },
          { coordinate, value },
        ];

        const expectedResponse = { error: 'Required field(s) missing' };

        Promise.all(
          missingFieldBodies.map((body) => {
            return chai
              .request(server)
              .post('/api/check')
              .send({ ...body });
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res, i) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.include(
                res.body,
                expectedResponse,
                'Response should contain error property with "field(s) missing" error message',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/check with an invalid coordinate returns an "invalid coordinate" error', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const value = '7';

        const invalidCoordinateBodies = [
          { puzzle, coordinate: '1', value },
          { puzzle, coordinate: 'B', value },
          { puzzle, coordinate: '99', value },
          { puzzle, coordinate: 'A100', value },
          { puzzle, coordinate: 'I0', value },
          { puzzle, coordinate: 'X1', value },
          { puzzle, coordinate: 'AA', value },
        ];

        const expectedResponse = { error: 'Invalid coordinate' };

        Promise.all(
          invalidCoordinateBodies.map((body) => {
            return chai
              .request(server)
              .post('/api/check')
              .send({ ...body });
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res, i) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.include(
                res.body,
                expectedResponse,
                'Response should contain error property with "Invalid coordinate" error message',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });

      test('Test POST /api/check with an invalid value returns an "invalid value" error', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const coordinate = 'A1';

        const invalidValueBodies = [
          { puzzle, coordinate, value: '0' },
          { puzzle, coordinate, value: '10' },
          { puzzle, coordinate, value: '99' },
          { puzzle, coordinate, value: 'A' },
          { puzzle, coordinate, value: true },
          { puzzle, coordinate, value: false },
          { puzzle, coordinate: 'X99', value: '24' }, // Invalid value error overrules Invalid Coordinate
        ];

        const expectedResponse = { error: 'Invalid value' };

        Promise.all(
          invalidValueBodies.map((body) => {
            return chai
              .request(server)
              .post('/api/check')
              .send({ ...body });
          }),
        )
          .then((responseArray) => {
            responseArray.forEach((res, i) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be application/json',
              );
              assert.isObject(res.body, 'Response body should be an object');
              assert.include(
                res.body,
                expectedResponse,
                'Response should contain error property with "Invalid value" error message',
              );
            });

            done();
          })
          .catch((err) => done(err));
      });
    },
  );
});
