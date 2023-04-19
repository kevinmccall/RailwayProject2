const network = require('../network.js');
const assert = require('chai').assert;
const railway = require('../railway.js');

describe('testing network()', function() {
  it('should create a station for each stop in a network', function() {
    const file = './notional_ra.json';
    const system = railway.readData(file);
    const allStations = new Set();
    railway.getRoutes(system).forEach((route) => {
      route.stops.forEach((stop) => {
        allStations.add(stop.stationName);
      });
    });
    const graph = network.network(file);
    assert.includeMembers(Object.keys(graph), Array.from(allStations));
  });

  it('should throw a TypeError error if fileName is the wrong data type', function() {
    const file = {};
    assert.throws(function() {
      network(file);
    }, TypeError);
  });

  it('should be able to load a railway station with cycles without causing an infinite loop', function() {
    const file = 'kevin_railway.json';
    assert.doesNotThrow(function() {
      railway.readData(file);
    });
  });
});

describe('testing getBestRoute()', function() {
  it('should throw a TypeError if station is not found', function() {
    const graph = network.network('./notional_ra.json');
    assert.throws(function() {
      network.getBestRoute(graph, 'Tyson', 'Clackton', 2);
    }, TypeError);
  });
  it('should instantly stop if you ask for a journey to the same place',
    function() {
      const graph = network.network('./simpleton_railway.json');
      const journey = network.getBestRoute(graph, 'Alphaville', 'Alphaville')[0];
      assert.isTrue(journey.success);
      assert.equal(journey.distance, 0);
      assert.equal(journey.changes, 0);
    });
  it('should only return 1 result when passed 1 max result', function() {
    const graph = network.network('simpleton_railway.json');
    const maxResults = 1;
    assert.equal(
      network.getBestRoute(graph, 'Alphaville', 'Epsilon', maxResults).length,
      maxResults);
  });
  it('should find three routes for Truro to Oban with changes 2, 3, 3',
    function() {
      const graph = network.network('railtrack_uk.json');
      const maxResults = 3;
      const journeys = network.getBestRoute(graph, 'Truro', 'Oban', maxResults);
      assert.equal(journeys[0].changes, 2);
      assert.equal(journeys[0].distance, 870);
      assert.equal(journeys[1].changes, 3);
      assert.equal(journeys[1].distance, 840);
      assert.equal(journeys[2].changes, 3);
      assert.equal(journeys[2].distance, 840);
    });
  describe('should be able to find a path in a graph with cycles', function() {
    let graph = null;
    this.beforeEach(function() {
      graph = network.network('kevin_railway.json');
    });

    it('should find 2 routes to Betaford from Alphaville', function() {
      const maxResults = 2;
      const journeys = network.getBestRoute(graph,
        'Alphaville', 'Betaford', maxResults);
      const alphaville = graph['Alphaville'];
      const betaford = graph['Betaford'];
      const gammaton = graph['Gammaton'];
      assert.equal(journeys.length, maxResults);
      assert.includeMembers(journeys[0].stations, [alphaville, betaford]);
      assert.includeMembers(journeys[1].stations,
        [alphaville, betaford, gammaton]);
    });
  });
});

describe('testing with console.log', function() {
  // Mock logger to test functions that log to the console
  let originalConsoleLog = null;
  let log = '';
  before(function() {
    originalConsoleLog = console.log;
  });

  beforeEach(function() {
    log = '';
    console.log = (...args) => {
      log += args.join('\n');
    };
  });

  afterEach(function() {
    console.log = originalConsoleLog;
  });

  describe('testing printUsageMethod()', function() {
    it('should should return the usage message', function() {
      network.printUsageMessage();
      assert.equal(log, 'Error! Usage: node network.js <data set> ' +
        '<origin> <destination> <max results>');
    });
  });

  describe('testing displayRoutes()', function() {
    it('should return a message for invalid input', function() {
      network.displayRoutes();
      assert.equal(log, 'Invalid input');
    });

    it('should have a unique message for no routes found', function() {
      network.displayRoutes([]);
      assert.include(log, 'One or more station cannot be found on this network');
      assert.include(log, 'Routes found: 0');
    });

    it('should properly format a completed journey', function() {
      const graph = network.network('simpleton_railway.json');
      const maxResults = 1;
      const journeys = network.getBestRoute(graph, 'Alphaville', 'Epsilon', maxResults);
      network.displayRoutes(journeys);
      assert.include(log, 'Routes found: 1');
      assert.include(log, '1:');
      assert.include(log, 'Embark at Alphaville on Simpleton');
      assert.include(log, 'Total distance :100');
      assert.include(log, 'Changes :0');
      assert.include(log, 'Passing through: Alphaville, Betaford, Gammaton, Deltafield, Epsilon,');
    });
  });

  describe('testing main, should exit with a message for each', function() {
    // Mock process.exit to test functions that quit out of the program

    let oldExit = null;
    let exited = false;

    before(function() {
      oldExit = process.exit;
    });

    beforeEach(function() {
      exited = false;
      process.exit = () => {
        exited = true;
        console.log('exited');
      };
    });

    afterEach(function() {
      process.exit = oldExit;
    });

    it('should throw a type error if <max results> is not a number',
      function() {
        network.main('railtrack_uk.json', 'Oban', 'Glasgow', 'seven');
        assert.isTrue(exited);
        assert.include(log, 'maxResults is not a number');
      });

    it('should throw an error if data is not a string', function() {
      network.main({}, 'Oban', 'Glasgow', 7);
      assert.isTrue(exited);
      assert.include(log, 'data must be a valid filename string');
    });
    it('should throw an error if origin is not a string', function() {
      network.main('railtrack_uk.json', null, 'Glasgow', 7);
      assert.isTrue(exited);
      assert.include(log, 'origin is not a string');
    });
    it('should throw an error if destination is not a string', function() {
      network.main('railtrack_uk.json', 'Oban', NaN, 7);
      assert.isTrue(exited);
      assert.include(log, 'destination is not a string');
    });
    it('should work normally when everything is ok', function() {
      network.main('railtrack_uk.json', 'Oban', 'Glasgow', 7);
      assert.isFalse(exited);
    });
  });
});


