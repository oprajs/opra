const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {

  sort(tests) {
    return Array.from(tests)
        .sort((testA, testB) => (testA.path > testB.path ? 1 : -1));
  }

}

module.exports = CustomSequencer;
