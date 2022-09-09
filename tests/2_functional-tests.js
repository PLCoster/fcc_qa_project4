const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('API Tests', () => {
    suite('POST /api/solve with puzzle string => solve sudoku puzzle', () => {
      test('Test POST /api/solve with valid puzzle string, returns solution', (done) => {
        const puzzle =
          '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const expectedResponse = {
          solution:
            '769235418851496372432178956174569283395842761628713549283657194516924837947381625',
        };

        chai
          .request(server)
          .post('/api/solve')
          .send({ puzzle })
          .then((res) => {
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
              'Response should contain solution property with correct solution string',
            );

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
