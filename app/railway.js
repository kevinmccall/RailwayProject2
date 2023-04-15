/**
 * @fileoverview Holds methods and objects to view railway station data.
 * @author Kevin McCall
 * @version 1.0
 */
'use strict';

const fs = require('fs');
//
// Add your names in here
// Kevin McCall

// Add your functions here.

/**
 * Represents a railway network.
 * @constructor
 * @param {string} networkName - The name of the network.
 * @param {!Array<Route>} routes - An array of routes for the network.
 */
function RailwayNetwork(networkName, routes) {
  this.networkName = networkName;
  /** @type {Array{Route}} */
  this.routes = routes;
}

/**
 * Represents a route in a railway network. Contains a distance field that
 *    needs to be set with the addDistances() function.
 * @constructor
 * @param {string} name - The name of the specific route.
 * @param {!Array<Stop>} stops - An array of stops for the route to visit.
 * @param {string} color - The color to display the route.
 */
function Route(name, stops, color) {
  this.name = name;
  /** @type {Array<Stop>} */
  this.stops = stops;
  this.color = color;
  this.distance = undefined;
}

/**
 * Represents a stop in a railway network.
 * @constructor
 * @param {number} number - The index of the stop on the route (starting at 1).
 * @param {string} stationName - The name of the station.
 * @param {number} stationId - The unique ID of the station.
 * @param {number} distanceToNext - The distance to the next station or null.
 * @param {number} distanceToPrev - The distance to the previous station
 *    or null.
 */
function Stop(number, stationName, stationId, distanceToNext, distanceToPrev) {
  this.number = number;
  this.stationName = stationName;
  this.stationId = stationId;
  this.distanceToNext = distanceToNext;
  this.distanceToPrev = distanceToPrev;
}

/**
 * Returns a RailwayNetwork object when given a filename to a JSON object.
 * @param {string} fileName - The path and filename to a JSON file that
 *    contains a railway system.
 * @return {?RailwayNetwork} An object of type RailwayNetwork.
 * @throws Throws an error if the file is not found.
 */
function loadData(fileName) {
  let res = null;
  if (typeof fileName == 'string') {
    try {
      const jsonData = JSON.parse(fs.readFileSync(fileName));
      jsonData.routes.forEach((route) => {
        route.stops.forEach((stop) => {
          // Rename properties of JSON to match objects.
          stop.number = stop.stop;
          stop.stationId = stop.stationID;
          delete stop.stop;
          delete stop.stationID;
          // Set protoypes of JSON to allow instanceof checks.
          Object.setPrototypeOf(stop, Stop.prototype);
        });
        Object.setPrototypeOf(route, Route.prototype);
      });
      Object.setPrototypeOf(jsonData, RailwayNetwork.prototype);
      res = jsonData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error('File not found', error);
      }
      throw error;
    }
  }
  return res;
}

/**
 * Returns the name of a RailwayNetwork.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @return {string} - The name of the RailwayNetwork.
 */
function getNetworkName(data) {
  let res = null;
  if (data instanceof RailwayNetwork) {
    res = data.networkName;
  }
  return res;
}

/**
 * Returns an array of the routes of a RailwayNetwork. Order is determined by
 *    sorting methods.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @return {!Array<Route>}
 */
function getRoutes(data) {
  let res = null;
  if (data instanceof RailwayNetwork) {
    res = data.routes;
  }
  return res;
}

/**
 * Returns an array of the names of the routes of a RailwayNetwork.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @return {!Array<string>} - The array of route names.
 */
function getRouteNames(data) {
  let res = null;
  if (data instanceof RailwayNetwork) {
    res = [];
    data.routes.forEach((route) => {
      res.push(route.name);
    });
  }
  return res;
}

/**
 * Returns a string of all names of the routes of a RailwayNetwork.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @return {string} - The string of route names.
 */
function routeNamesToString(data) {
  return getRouteNames(data)?.join(',\n');
}

/**
 * Returns a Route from a RailwayNetwork based of the route's name.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @param {string} routeName - Name of the route.
 * @return {?Route} - A Route matching the name or null.
 */
function getRoute(data, routeName) {
  let res = null;
  if (data instanceof RailwayNetwork) {
    data.routes.forEach((route) => {
      if (route.name === routeName) {
        res = route;
      }
    });
  }
  return res;
}

/**
 * Returns a Stop from a Route based of the stop's name.
 * @param {!Route} route - The Route.
 * @param {string} name - Name of the route.
 * @return {?Stop} - A Stop matching the name or null.
 */
function getStop(route, name) {
  let res = null;
  if (route instanceof Route) {
    route.stops.forEach((stop) => {
      if (stop.stationName === name) {
        res = stop;
      }
    });
  }
  return res;
}

/**
 * Returns a formatted synopsis of a Route that includes all stops and
 *    distances traveled to each route.
 * @param {!Route} route - The route.
 * @return {string}
 */
function routeToString(route) {
  let res = null;
  if (route instanceof Route) {
    let distanceTraveled = 0;
    res = `ROUTE: ${route.name}(${route.color})\nSTATIONS:\n`;
    route.stops.forEach((stop) => {
      res += `${stop.number} ${stop.stationName} ${distanceTraveled} miles\n`;
      distanceTraveled += stop.distanceToNext;
    });
    res += `Total Route Distance: ${distanceTraveled} miles`;
  }
  return res;
}

/**
 * Returns a formatted synopsis of all routes in a RailwayNetwork. The synopsis
 *     contains the names of the routes, the starting stop, the ending stop,
 *     and the distance of the route.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @return {string}
 */
function routeSummary(data) {
  const width1 = 25;
  const width2 = 25;
  const width3 = 25;
  const width4 = 15;
  let res = null;
  if (data instanceof RailwayNetwork) {
    // header of text
    res = 'Routes Summary\n==============\n';
    // loop through and add each route summary
    data.routes.forEach((route) => {
      res +=
        `${route.name.padEnd(width1, ' ')}-` +
        `${route.stops[0].stationName.padEnd(width2, ' ')}` +
        `${route.stops[route.stops.length - 1].stationName.padEnd(
          width3,
          ' '
        )}-` +
        `${String(routeDistance(route)).padStart(width4, ' ')}` +
        ` miles\n`;
    });
  }
  return res;
}

/**
 * Returns the total number of stations in a RailwayNetwork without duplicates.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @return {number}
 */
function totalStations(data) {
  let res = null;
  if (data instanceof RailwayNetwork) {
    const stations = new Set();
    // add all stations to a set and count the set size to get unique stations
    data.routes.forEach((route) => {
      route.stops.forEach((stop) => {
        stations.add(stop.stationId);
      });
    });
    res = stations.size;
  }
  return res;
}

/**
 * Returns the length from the first stop of a route to the end. Could be
 *    different from the backwards distance.
 * @param {!Route} route - The route.
 * @return {number}
 */
function routeDistance(route) {
  let res = null;
  if (route instanceof Route) {
    let distance = 0;
    // loop through stops and get total forward distance
    route.stops.forEach((stop) => {
      distance += stop.distanceToNext;
    });
    res = distance;
  }
  return res;
}

/**
 * Returns the Route with the longest distance in a RailwayNetwork.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @return {?Route} - The longest route or null if the RailwayNetwork is empty.
 */
function findLongestRoute(data) {
  let res = null;
  if (data instanceof RailwayNetwork) {
    let longestRoute = null;
    let highestDistance = 0;
    data.routes.forEach((route) => {
      // Find the maximum distance of the routes.
      if (routeDistance(route) > highestDistance) {
        highestDistance = routeDistance(route);
        longestRoute = route;
      }
    });
    res = longestRoute;
  }
  return res;
}

/**
 * Adds a property of distance to all Route objects in a RailwayNetwork.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 */
function addDistances(data) {
  if (data instanceof RailwayNetwork) {
    data.routes.forEach((route) => {
      const dist = routeDistance(route);
      route.distance = dist;
    });
  }
}

/**
 * Sorts the route property of the RailwayNetwork lexographically by route
 *    name.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @param {boolean} asc - A boolean for sorting in a ascending order.
 */
function sortRoutesByName(data, asc) {
  if (data instanceof RailwayNetwork) {
    // compares names based off lexigraphical values
    const nameComparator = (r1, r2) => {
      let comparatorVal;
      if (r1.name < r2.name) comparatorVal = -1;
      else if (r1.name > r2.name) comparatorVal = 1;
      else comparatorVal = 0;
      return comparatorVal;
    };
    if (asc === true) {
      data.routes.sort(nameComparator);
    } else {
      data.routes.sort((a, b) => nameComparator(b, a));
    }
  }
}

/**
 * Sorts the route property of the RailwayNetwork by each route's distance.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @param {boolean} asc - A boolean for sorting in a ascending order.
 */
function sortRoutesByLength(data, asc) {
  if (data instanceof RailwayNetwork) {
    // compares routes based off the distances of the routes
    const lengthComparator = (r1, r2) => {
      let comparatorVal;
      if (r1.distance === undefined || r2.distance === undefined) {
        addDistances(data);
      }
      if (r1.distance < r2.distance) comparatorVal = -1;
      else if (r1.distance < r2.distance) comparatorVal = 1;
      else comparatorVal = 0;
      return comparatorVal;
    };
    if (asc === true) {
      data.routes.sort(lengthComparator);
    } else {
      data.routes.sort((a, b) => lengthComparator(b, a));
    }
  }
}

/**
 * Finds a path between two stops in any route in a RailwayNetwork.
 * @param {!RailwayNetwork} data - The RailwayNetwork.
 * @param {string} from - The name of the stop you are starting at.
 * @param {string} to - The name of the stop that you are ending at.
 * @return {string} - A string containing the number of stops and miles if
 *    a path is found, otherwise a string that states no route has been found.
 */
function findRoute(data, from, to) {
  let res = `No direct route found between ${from} and ${to}`;
  if (data instanceof RailwayNetwork) {
    data.routes.forEach((route) => {
      const route1 = getStop(route, from);
      const route2 = getStop(route, to);
      if (route1 != null && route2 != null) {
        const diff = route2.number - route1.number;
        let distance = 0;
        let numStops = 0;
        // if route is forward
        if (diff > 0) {
          for (let i = route1.number - 1; i < route2.number - 1; i++) {
            distance += route.stops[i].distanceToNext;
            numStops++;
          }
        } else if (diff < 0) {
          /* If route is going backwards*/ for (
            let i = route1.number - 1;
            i > route2.number - 1;
            i--
          ) {
            distance += route.stops[i].distanceToPrev;
            numStops++;
          }
        }
        // add closing line
        res =
          `${route.name}: ${from} to ${to} ` +
          `${numStops} stops and ${distance} miles`;
      }
    });
  }
  return res;
}

/**
 * Conduct a range of tests on the functions developed
 * @param {string} fileName - The name and path of the JSON file to load.
 * @param {string} lineName - The name of line to look for in test 5.
 **/
function main(fileName, lineName) {
  // Load the railway data structure from rom file.
  const data = loadData(fileName);
  addDistances(data);

  // Test route name
  console.log('===TEST=1=NETWORK=NAME===');
  console.log(getNetworkName(data));

  // Test getting routes
  console.log('\nTEST=2=GETTING=ROUTES=ARRAY');
  console.log('There are ' + getRoutes(data).length + 'routes on this network');
  console.log('The typeof the routes is ' + typeof getRoutes(data));

  // Test getting route names
  console.log('\n===TEST=3=ROUTE=NAMES===');
  console.log(getRouteNames(data));

  // Test getting route names formated as a String
  console.log('\n===TEST=4=ROUTE=NAMES=TOSTRING===');
  console.log(routeNamesToString(data));

  // Test getting data for one route
  console.log('\n===TEST=5=GET=ROUTE===');
  let route = getRoute(data, lineName);
  if (route != null) {
    console.log('Found: ' + route.name);
  } else {
    console.log('Route not found');
  }

  // Test route toString
  console.log('\n===TEST=6=ROUTE=TO=STRING===');
  console.log(routeToString(route));

  // Test route distance calculation
  console.log('\n===TEST=7=ROUTE=DISTANCE===');
  const dist = routeDistance(route);
  console.log('Distance of Line as calculated: ' + dist);

  // Test the routeSummay function
  console.log('\n===TEST=8=ROUTE=SUMMARY===');
  console.log(routeSummary(data));

  // Test sorting routes by name in ascending order
  console.log('\n===TEST=9=SORT=ROUTE=BY=NAME===');
  sortRoutesByName(data, true);
  console.log(routeSummary(data));

  // Test sorting routes by name in descending order
  console.log('\n===TEST=10=SORT=ROUTE=BY=NAME=(DESC)===');
  sortRoutesByName(data);
  console.log(routeSummary(data));

  // Test sorting in assending order
  console.log('\n===TEST=11=SORT=ROUTE=BY=LENGTH=(ASC)===');
  sortRoutesByLength(data, true);
  console.log(routeSummary(data));

  // Test sorting in descending order
  console.log('\n===TEST=12=SORT=ROUTE=BY=LENGTH=(DESC)===');
  sortRoutesByLength(data, false);
  console.log(routeSummary(data));

  // Test finding the longest route
  console.log('\n===TEST=13=FIND=LONGEST=ROUTE===');
  route = findLongestRoute(data);
  console.log('Longest route is: ' + routeToString(route) + '\n');

  // Test routeDistance
  console.log('\n===TEST=14=Total_Stations===');
  const n = totalStations(data);
  console.log('There are ' + n + ' stations in this network.');

  // TEst finding route from to.
  console.log('\n====(OPTIONAL) TEST=BONUS1=FIND=FROM=TO===');
  const str = findRoute(data, 'Cardiff', 'Reading');
  console.log('>>END>>' + str);
} // end main

// Call the main function
if (require.main === module) {
  const TARGET_COMMAND_LINE_ARGS = 4;
  if (process.argv.length >= TARGET_COMMAND_LINE_ARGS) {
    // Run the program with command line arguments
    main(process.argv[2], process.argv[3]);
  } else {
    main('notional_ra.json', 'Northern Line');
  }
}

exports.readData = loadData;
exports.getNetworkName = getNetworkName;
exports.getRoutes = getRoutes;
exports.getRouteNames = getRouteNames;
exports.routeNamesToString = routeNamesToString;
exports.routeSummary = routeSummary;
exports.getRoute = getRoute;
exports.totalStations = totalStations;
exports.routeToString = routeToString;
exports.routeDistance = routeDistance;
exports.findLongestRoute = findLongestRoute;
exports.addDistances = addDistances;
exports.sortRoutesByName = sortRoutesByName;
exports.sortRoutesByLength = sortRoutesByLength;
exports.getStop = getStop;

// main('smokey_mountain.json', 'Dilsboro to Nantahala');
