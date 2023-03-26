/**
 * Author: Kevin McCall
 *
 * Creates a graph for finding the most effecient paths across
 * a railway system.
 **/
// @ts-check
'use strict';

const {readData, getNetworkName, getRoutes, getRouteNames, routeNamesToString,
  routeSummary, getRoute, totalStations, routeToString, routeDistance,
  findLongestRoute} = require('./railway.js');

/**
 * Holds data for a station. On a graph this will represent the nodes of the
        graph.
 * Each station hold an array of links to other stations (these represent the
        edges of a graph).
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

Journey.prototype.copy = function() {
  const cloned = new Journey();
  cloned.stations = this.stations.slice();
  cloned.distance = this.distance;
  cloned.text = this.text;
  cloned.success = this.success;
  cloned.changes = this.changes;
  return cloned;
};

Journey.prototype.incDistance = function(amt) {
  if (!isNaN(amt) && amt > 0) {
    this.distance += amt;
  }
};

Journey.prototype.report = function() {
  let output = '';
  output += 'Journey Summary\n==============\n';
  output += this.text;
  output += `\nTotal distance :${this.distance}\nChanges :${this.changes}\n`;
  output += `Passing through: ` +
  `${this.stations.map((station) => station.stationName).join(', ')}`;
  return output;
};

Journey.prototype.addChange() = function(stationName, newRouteName) {
  this.text += `At ` +
  `${stationName}` +
  ` change to ${newRouteName}\n`;
}

Journey.prototype.addFirstStop() = function(originName, routeName) {
  this.text = `Embark at ${originName} on ` +
    `${routeName}\n`;
}

/**
 *
 * @param {string} fileName The function receives the file name of the railway
        network for which a graph will be built
 * @return {object} The filled out graph mapping station names to station
 * objects.
 */
const network = (fileName) => {
  let res = null;
  const graph = {};
  try {
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
          if (i - 1 >= 0 &&
            stops[i - 1].stationName in graph) {
            // convert the previous stop index into a station object
            const previousStation = graph[stops[i - 1].stationName];
            const currentToPrev = new Link(route.name, previousStation,
                stop.distanceToPrev);
            const prevToCurrent = new Link(route.name, currentStation,
                stops[i - 1].distanceToNext);
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
 * converts the railway network data structure from project one in to a graph
      that can be traversed to ascertain the best route between two stations.
 *
 * @param {object} graph The graph built by the network method.
 * @param {string} origin The name of the origin station (where a journey
      begins).
 * @param {string} destination The name of the destination station (where a
      journey ends).
 * @param {number} maxResults The maximum number of results to return.
 * @return {Array<Journey>} A list of possible Journeys sorted by number of
 *    changes then distance traveled.
 */
const getBestRoute = (graph, origin, destination, maxResults) => {
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
  const possibleRoutes = [];
  const journey = new Journey();
  doGetBestRoute(graph, originStation, destinationStation, journey,
      possibleRoutes, 'origin');
  possibleRoutes.sort(sortJourney);
  return possibleRoutes.slice(0, maxResults);
};

/**
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
const doGetBestRoute = (graph, origin, destination, journey,
    routesFound, routeName) => {
  journey.stations.push(origin);
  if (origin === destination) {
    routesFound.push(journey);
    journey.success = true;
    journey.text += `Arrive at ${destination.stationName}`;
  } else {
    origin.links.forEach((link) => {
      if (!(journey.stations.includes(link.station) && !journey.success)) {
        // Code ran whenever we change routes
        if (routeName !== link.routeName) {
          journey = journey.copy();
          journey.changes += 1;
          // If we have only seen our origin station
          
        }
        journey.incDistance(link.distance);
        doGetBestRoute(graph, link.station, destination, journey,
            routesFound, link.routeName);
      }
    });
  }
};

/**
 *
 * @param {!Array<Journey>} journiesFound An array of completed journeys.
 */
const displayRoutes = (journiesFound) => {
  console.log(`Number of routes found: ${journiesFound.length}`);
  journiesFound.forEach((journey) => {
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
 */
const main = () => {
  try {
    const data = process.argv[2];
    const origin = process.argv[3];
    const destination = process.argv[4];
    const maxResults = parseInt(process.argv[5]);

    const daNetwork = network(data);
    const bestRoutes = getBestRoute(daNetwork, origin, destination, maxResults);
    displayRoutes(bestRoutes);
  } catch (error) {
    printUsageMessage();
    process.exit();
  }
};

const printUsageMessage = () => {
  console.log('Error! Usage: node network.js <data set> ' +
  '<origin> <destination> <max results>');
};

const testMain = () => {
  // const daNetwork = network('railtrack_uk.json');
  // // console.log(daNetwork);
  // const bestRoutes = getBestRoute(daNetwork, 'Truro', 'Oban', 3);
  // // console.log('bestRoutes :>> ', bestRoutes);
  const daNetwork = network('notional_ra.json');
  const bestRoutes = getBestRoute(daNetwork, 'Tadcaster', 'Lackluster', 3);

  displayRoutes(bestRoutes);
};

if (require.main === module) {
  // TODO: Undo this
  // main();
  testMain();
}
