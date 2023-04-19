/**
 * Author: Kevin McCall
 *
 * Creates a graph for finding the most effecient paths across
 * a railway system. Contains object and methods for finding paths.
 **/
// @ts-check
'use strict';

const { readData, getRoutes } = require('./railway.js');

/**
 * Holds data for a station. On a graph this will represent the nodes of
 * the graph. Each station hold an array of links to other stations (these
 * represent theedges of a graph).
 * @param {number} stationID The id number of the station (each station has an
        unique ID).
 * @param {string} stationName The name of the station.
 **/
function Station(stationID, stationName) {
  this.stationName = stationName;
  this.stationID = stationID;
  /**  @type {Array<Link>} */
  this.links = [];
}

/**
 * This function adds a link to a station.
 * @param {!Link} link The link object representing a link to another station.
 **/
Station.prototype.addLink = function(link) {
  this.links.push(link);
};

/**
 * Forms the links between one station and the next. This object is what allows
 * the stations to become nodes on a graph. Essentially in graph theory the
 * stations are the nodes and the Link objects are the edges.
 *
 * @param {string} routeName The name of the route.
 * @param {!Station} station The next station to go to.
 * @param {number} distance The distance to the next station
 */
function Link(routeName, station, distance) {
  this.routeName = routeName;
  this.distance = distance;
  this.station = station;
  this.linklName = station.stationName;
} // end link

/**
 * This object defines a journey on the railway network that a passenger may
 * take from one location to another. A journey may pass though multiple
 * routes or be on asingle route. The object is useful in building up journeys
 * when traversing the graph to discover what paths can be taken from the origin
 * to the destination.
 */
function Journey() {
  /** @type {Array<Station>} */
  this.stations = [];
  this.distance = 0;
  this.text = '';
  this.success = false;
  this.changes = 0;
}

/**
 * Creates a shallow clone of the Journey object
 * @return {Journey}
 */
Journey.prototype.copy = function() {
  const cloned = new Journey();
  cloned.stations = this.stations.slice();
  cloned.distance = this.distance;
  cloned.text = this.text;
  cloned.success = this.success;
  cloned.changes = this.changes;
  return cloned;
};

/**
 * Increased distances travelled property
 * @param {number} amt
 */
Journey.prototype.incDistance = function(amt) {
  if (!isNaN(amt) && amt > 0) {
    this.distance += amt;
  }
};

/**
 * Creates a report of a Journey, including the total distance traveled, the
 * number of changes between routes, and the stations passed through
 * @return {string} formatted synopsis string
 */
Journey.prototype.report = function() {
  let output = '';
  output += 'Route Summary\n==============\n';
  output += this.text;
  output += `\n\nTotal distance :${this.distance}\nChanges :${this.changes}\n`;
  output +=
    `Passing through: ` +
    `${this.stations.map((station) => station.stationName).join(', ')},`;
  return output;
};

/**
 * Helper method for whenever you change routes on a journey.
 * @param {string} stationName The name of the station
 * @param {string} newRouteName The name of the new route being switched to
 */
Journey.prototype.addChange = function(stationName, newRouteName) {
  this.changes += 1;
  this.text += `At ` + `${stationName}` + ` change to ${newRouteName}\n`;
};

/**
 * Adds the first stop to the text of the Journey.
 * @param {string} originName The name of the starting station
 * @param {string} routeName The name of the route that you start on
 */
Journey.prototype.addFirstStop = function(originName, routeName) {
  this.text = `Embark at ${originName} on ` + `${routeName}\n`;
};

/**
 * converts the railway network data structure from project one in to a graph
 * that can be traversed to ascertain the best route between two stations.
 * @param {string} fileName The function receives the file name of the railway
        network for which a graph will be built
 * @return {object} The filled out graph mapping station names to station
 * objects.
 */
const network = (fileName) => {
  let res = null;
  const graph = {};
  try {
    if (typeof fileName !== 'string') {
      throw new TypeError('fileName must be a string');
    }
    const railwayObject = readData(fileName);
    if (railwayObject != null) {
      // loop through each route
      getRoutes(railwayObject).forEach((route) => {
        // loop through each stop in the route
        route.stops.forEach((stop, i, stops) => {
          let currentStation;
          // set currentStation and add it to the graph if it's not already
          // added
          if (stop.stationName in graph) {
            currentStation = graph[stop.stationName];
          } else {
            currentStation = new Station(stop.number, stop.stationName);
            graph[stop.stationName] = currentStation;
          }
          // for the previous link (check and see if there is a valid previous
          // station)
          if (i - 1 >= 0 && stops[i - 1].stationName in graph) {
            // convert the previous stop index into a station object
            const previousStation = graph[stops[i - 1].stationName];
            const currentToPrev = new Link(
              route.name,
              previousStation,
              stop.distanceToPrev,
            );
            const prevToCurrent = new Link(
              route.name,
              currentStation,
              stops[i - 1].distanceToNext,
            );
            currentStation.addLink(currentToPrev);
            previousStation.addLink(prevToCurrent);
          }
        });
      });
      res = graph;
    }
  } catch (error) {
    // raise error for other person to handle
    throw error;
  }
  return res;
};

/**
 * Builds Journey objects comprimising of all the routes without repeat stations
 * and returns the top results sorted by number of route changes and then
 * distance
 * @param {object} graph The graph built by the network method.
 * @param {string} origin The name of the origin station (where a journey
 * begins).
 * @param {string} destination The name of the destination station (where a
 * journey ends).
 * @param {number} maxResults The maximum number of results to return.
 * @return {Array<Journey>} A list of possible Journeys sorted by number of
 *    changes then distance traveled.
 */
const getBestRoute = (graph, origin, destination, maxResults) => {
  // sorts journeys by number of changes then distance traveled.
  const sortJourney = (journeyA, journeyB) => {
    if (journeyA.changes > journeyB.changes) {
      return 1;
    } else if (journeyA.changes < journeyB.changes) {
      return -1;
    }

    if (journeyA.distance > journeyB.distance) {
      return 1;
    } else if (journeyA.distance < journeyB.distance) {
      return -1;
    } else {
      return 0;
    }
  };
  const originStation = graph[origin];
  const destinationStation = graph[destination];
  if (originStation === undefined || destinationStation === undefined) {
    throw new TypeError('Station not found in network');
  }
  const possibleRoutes = [];
  const journey = new Journey();
  doGetBestRoute(
    graph,
    originStation,
    destinationStation,
    journey,
    possibleRoutes,
    'origin',
  );
  possibleRoutes.sort(sortJourney);
  return possibleRoutes.slice(0, maxResults);
};

/**
 * Recursive method to depth-first-search a graph for the most effecient routes.
 *
 * @param {object} graph The graph built by the network method.
 * @param {!Station} origin The origin station object.
 * @param {!Station} destination The destination station object.
 * @param {!Journey} journey A journey object to store the current progress.
 * @param {!Array<Journey>} routesFound A reference to an array in which to
 * store completed routes.
 * @param {string} routeName The name of the route just travelled on prior to
   arriving at this function invocation.
 */
const doGetBestRoute = (
  graph,
  origin,
  destination,
  journey,
  routesFound,
  routeName,
) => {
  journey.stations.push(origin);
  // base case
  if (origin === destination) {
    routesFound.push(journey);
    journey.success = true;
    journey.text += `Arrive at ${destination.stationName}`;
  } else {
    // Loop through all the connected links
    origin.links.forEach((link) => {
      if (!journey.stations.includes(link.station)) {
        let newJourney;
        // if it is the start of building the route, call helper method
        if (routeName === 'origin') {
          newJourney = journey.copy();
          newJourney.addFirstStop(origin.stationName, link.routeName);
        } else if (link.routeName !== routeName) {
          /* If you switch routes*/ newJourney = journey.copy();
          newJourney.addChange(origin.stationName, link.routeName);
        } else {
          // couldn't do optimization because it could follow down the main path
          // and then the journey object would be mutated, causing the remaining
          // routes to be built incorrectly. Would have to change the order of
          // links for optimization to be possible
          newJourney = journey.copy();
        }
        newJourney.incDistance(link.distance);
        doGetBestRoute(
          graph,
          link.station,
          destination,
          newJourney,
          routesFound,
          link.routeName,
        );
      }
    });
  }
};

/**
 * Prints out and enumerates information relating to the found journies.
 * @param {!Array<Journey>} journiesFound An array of completed journeys.
 */
const displayRoutes = (journiesFound) => {
  if (journiesFound == null || !Array.isArray(journiesFound)) {
    console.log('Invalid input');
    return;
  }

  // if no routes are found
  if (journiesFound.length === 0) {
    console.log('One or more station cannot be found on this network\n\n\n');
  }
  console.log(`Routes found: ${journiesFound.length}`);
  // add each route report enumerated
  journiesFound.forEach((journey, i) => {
    console.log(`${i + 1}:`);
    console.log(journey.report());
    console.log('\n');
  });
};

/**
 * The main function will receive four command line parameters. The filename,
 * the name of the origin station, the name of the destination station, the
 * maximum number of results to return. If the parameters are invalid, this
 * function should inform the user with a usage error: Error! Usage: node
 * network.js <data set> <origin> <destination> <max results> If the parameters
 * are found to be valid then you should call the necessary functions to build
 * the graph, find the best routes and display the results.
 *
 * @param {string} data Filename of the json data to use
 * @param {string} origin Name of the starting station
 * @param {string} destination Name of the ending station
 * @param {number} maxResults Integer for maximum number of results to return
 */
const main = (data, origin, destination, maxResults) => {
  try {
    if (isNaN(parseInt(maxResults))) {
      throw new TypeError('maxResults is not a number');
    } else if (typeof origin !== 'string') {
      throw new TypeError('origin is not a string');
    } else if (typeof destination !== 'string') {
      throw new TypeError('destination is not a string');
    } else if (typeof data != 'string') {
      throw new TypeError('data must be a valid filename string');
    }
    const daNetwork = network(data);
    const bestRoutes = getBestRoute(daNetwork, origin, destination, maxResults);
    displayRoutes(bestRoutes);
  } catch (error) {
    // exit program with usage method if errors occur
    console.log(error);
    printUsageMessage();
    process.exit();
  }
};

const printUsageMessage = () => {
  console.log(
    'Error! Usage: node network.js <data set> ' +
    '<origin> <destination> <max results>',
  );
};

// main entry point idiom for file
if (require.main === module) {
  // get command line arguments
  const data = process.argv[2];
  const origin = process.argv[3];
  const destination = process.argv[4];
  const maxResults = parseInt(process.argv[5]);
  main(data, origin, destination, maxResults);
}

exports.network = network;
exports.getBestRoute = getBestRoute;
exports.doGetBestRoute = doGetBestRoute;
exports.displayRoutes = displayRoutes;
exports.main = main;
// log using console.log
exports.printUsageMessage = printUsageMessage;

