const railway = require('../railway.js');
const assert = require('chai').assert;

describe('Testing loadData', function() {
  it('should throw an error when file isn\'t present', function() {
    assert.throws(railway.readData.bind(railway, ''), 'ENOENT');
  });
  it('should throw an error if it loads a broken railway system', function() {
    assert.throws(function() {
      railway.readData('in_error.json');
    }, SyntaxError);
  });
  it('should return null if a string is not passed', function() {
    assert.isNull(railway.readData());
  });
  it('should should correctly load notional railway', function() {
    const railwaySystem = railway.readData('notional_ra.json');
    assert.equal(railwaySystem.networkName, 'Notional Railway Company');
    assert.isNotEmpty(railwaySystem.routes);
    const firstRoute = railwaySystem.routes[0];
    assert.equal(firstRoute.name, 'Cambleton Line');
    assert.equal(firstRoute.color, 'Magenta');
    assert.isNotEmpty(firstRoute.stops);
    const firstStop = firstRoute.stops[0];
    assert.equal(firstStop.number, 1);
    assert.equal(firstStop.stationName, 'Campbell Glen');
    assert.equal(firstStop.stationId, 1);
    assert.equal(firstStop.distanceToNext, '25');
    assert.equal(firstStop.distanceToPrev, null);
  });
  it('relative filepaths should work', function() {
    const railwaySystem = railway.readData('./notional_ra.json');
    assert.equal(railwaySystem.networkName, 'Notional Railway Company');
    assert.isNotEmpty(railwaySystem.routes);
    const firstRoute = railwaySystem.routes[0];
    assert.equal(firstRoute.name, 'Cambleton Line');
    assert.equal(firstRoute.color, 'Magenta');
    assert.isNotEmpty(firstRoute.stops);
    const firstStop = firstRoute.stops[0];
    assert.equal(firstStop.number, 1);
    assert.equal(firstStop.stationName, 'Campbell Glen');
    assert.equal(firstStop.stationId, 1);
    assert.equal(firstStop.distanceToNext, '25');
    assert.equal(firstStop.distanceToPrev, null);
  });
});

describe('Testing railwayNetwork functions', function() {
  let railwaySystem;
  beforeEach(function() {
    railwaySystem = railway.readData('notional_ra.json');
  });

  describe('Testing getNetworkName()', function() {
    it('should return the correct name if passed in a railwaynetwork', function() {
      assert.equal(
        railway.getNetworkName(railwaySystem),
        'Notional Railway Company',
      );
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.getNetworkName('no'));
    });
  });

  describe('Testing getRoutes()', function() {
    it('should return the routes of a railwaysystem', function() {
      assert.equal(railway.getRoutes(railwaySystem), railwaySystem.routes);
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.getRoutes('no'));
    });
  });

  describe('Testing getRouteNames()', function() {
    it('should return the correct name if passed in a railwaynetwork', function() {
      assert.includeMembers(railway.getRouteNames(railwaySystem), [
        'Cambleton Line',
        'Northern Line',
        'Central Line',
      ]);
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.getRouteNames('no'));
    });
  });

  describe('Testing routeNamesToString()', function() {
    it('should return the correct name if passed in a railwaynetwork', function() {
      assert.equal(
        railway.routeNamesToString(railwaySystem),
        'Cambleton Line,\nNorthern Line,\nCentral Line',
      );
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.routeNamesToString('no'));
    });
  });

  describe('Testing getRoute()', function() {
    it('should return Northern Line', function() {
      const northernLine = railwaySystem.routes[1];
      assert.equal(
        railway.getRoute(railwaySystem, 'Northern Line'),
        northernLine,
      );
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.getRoute('no'));
    });
  });

  describe('Testing getStop()', function() {
    it('should return Tadcaster', function() {
      const northernLine = railwaySystem.routes[1];
      assert.equal(
        railway.getStop(northernLine, 'Tadcaster').stationName,
        'Tadcaster',
      );
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.getStop('no'));
    });
  });

  describe('Testing routeToString()', function() {
    it('should format Northern Line correctly', function() {
      const northernLine = railwaySystem.routes[1];
      const routeSynopsis = railway.routeToString(northernLine);
      assert.include(routeSynopsis, 'ROUTE: Northern Line(blue)\nSTATIONS:\n');
      assert.include(routeSynopsis, '1 Tadcaster 0 miles');
      assert.include(routeSynopsis, '2 Central 30 miles');
      assert.include(routeSynopsis, '3 Lackluster 60 miles');
      assert.include(routeSynopsis, 'Total Route Distance: 60 miles');
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.getRoute('no'));
    });
  });

  describe('Testing routeSummary()', function() {
    it('should return Northern Line', function() {
      const routeSummary = railway.routeSummary(railwaySystem);
      assert.include(routeSummary, 'Routes Summary\n==============\n');

      // regex to match the Cambleton Line
      assert.match(
        routeSummary,
        /Cambleton Line\s+-Campbell Glen\s+Elton\s+-\s+100 miles/,
      );

      // regex to match the Northern Line
      assert.match(
        routeSummary,
        /Northern Line\s+-Tadcaster\s+Lackluster\s+-\s+60 miles/,
      );

      // regex to match the Central Line
      assert.match(
        routeSummary,
        /Central Line\s+-Campbell Glen\s+Chester\s+-\s+100 miles/,
      );
    });

    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.routeSummary('no'));
    });
  });

  describe('Testing routeDistance()', function() {
    it('should return a distance of 60 for the northern line', function() {
      const northernLine = railwaySystem.routes[1];
      const calculatedDistance = railway.routeDistance(northernLine);
      const actualDistance = 60;
      assert.equal(calculatedDistance, actualDistance);
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.routeDistance('no'));
    });
  });

  describe('Testing findLongestRoute()', function() {
    it('should return Central Line', function() {
      const cambletonLine = railwaySystem.routes[0];
      const longestRoute = railway.findLongestRoute(railwaySystem);
      assert.equal(longestRoute, cambletonLine);
    });
    it('should return null if incorrect data is passed', function() {
      assert.isNull(railway.findLongestRoute('no'));
    });
  });

  describe('Testing addDistances()', function() {
    it('It should add a distances property to the routes', function() {
      railway.addDistances(railwaySystem);
      railwaySystem.routes.forEach((route) => {
        assert.property(
          route,
          'distance',
          'route does not have distance property',
        );
      });
    });
    it('should do nothing if incorrect data is passed', function() {
      railwaySystem.routes.forEach((route) => {
        assert.isUndefined(route.distance, 'route has a distance property');
      });
    });
  });

  describe('Testing sortRoutesByName()', function() {
    it('it should sort Cambleton Line > Central Line > Northern Line ascending', function() {
      railway.sortRoutesByName(railwaySystem, true);
      const summary = railway.routeSummary(railwaySystem);
      const sortRegex = /Cambleton Line.*\nCentral Line.*\nNorthern Line/;
      assert.match(summary, sortRegex, 'order is not ascending');
    });
    it('it should sort Northern Line > Central Line > Cambleton Line descending', function() {
      railway.sortRoutesByName(railwaySystem);
      const summary = railway.routeSummary(railwaySystem);
      const sortRegex = /Northern Line.*\nCentral Line.*\nCambleton Line/;
      assert.match(summary, sortRegex, 'order is not descending');
    });
  });

  describe('Testing sortRoutesByLength()', function() {
    it('should sort Northern Line > Cambleton Line > Central Line ascending', function() {
      railway.sortRoutesByLength(railwaySystem, true);
      const summary = railway.routeSummary(railwaySystem);
      const sortRegex = /Northern Line.*\nCambleton Line.*\nCentral Line/;
      assert.match(summary, sortRegex, 'order is not ascending');
    });
    it('it should sort Central > Cambleton > Northern descending', function() {
      railway.sortRoutesByLength(railwaySystem);
      const summary = railway.routeSummary(railwaySystem);
      const sortRegex = /Cambleton Line.*\nCentral Line.*\nNorthern Line/;
      assert.match(summary, sortRegex, 'order is not descending');
    });
  });
});

describe('Testing totalStations', function() {
  it('should return 9 for notional_ra', function() {
    const system = railway.readData('notional_ra.json');
    assert.equal(railway.totalStations(system), 9);
  });
  it('should return 3 for smokey_mountain', function() {
    const system = railway.readData('smokey_mountain.json');
    assert.equal(railway.totalStations(system), 3);
  });
  it('should return 5 for simpleton', function() {
    const system = railway.readData('simpleton_railway.json');
    assert.equal(railway.totalStations(system), 5);
  });
});

describe('testing findRoute()', function() {
  let railtrackUK;
  beforeEach(function() {
    railtrackUK = railway.readData('railtrack_uk.json');
  });

  it('should return message for not finding route', function() {
    const station1 = 'Lackluster';
    const station2 = 'Chester';

    const foundRoute = railway.findRoute(railtrackUK, station1, station2);
    assert.equal(
      foundRoute,
      'No direct route found between Lackluster and Chester',
    );
  });
  it('should return cardiff to reading on great western railway', function() {
    const station1 = 'Cardiff';
    const station2 = 'Reading';
    const foundRoute = railway.findRoute(railtrackUK, station1, station2);
    assert.equal(
      foundRoute,
      'Great Western Railway: Cardiff to Reading 3 stops and 145 miles',
    );
  });
  it('should return reading to cardiff on great western railway', function() {
    const station1 = 'Reading';
    const station2 = 'Cardiff';
    const foundRoute = railway.findRoute(railtrackUK, station1, station2);
    assert.equal(
      foundRoute,
      'Great Western Railway: Reading to Cardiff 3 stops and 145 miles',
    );
  });
});
