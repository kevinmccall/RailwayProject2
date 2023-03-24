/**
 * Author: Kevin McCall
 *
 * Creates a graph for finding the most effecient paths across
 * a railway system.
 **/
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
  this.stations = [];
  this.distance = 0;
  this.text = '';
  this.success = false;
  this.changes = 0;
}

Journey.prototype.copy = function() {
  return {...this};
};

Journey.prototype.incDistance = function(amt) {
  if (!isNaN(amt) && amt > 0) {
    this.distance += amt;
  }
};

Journey.prototype.report = function() {
  let output = '';
  output += 'Journey Summary\n==============\n';
  output += this.text + '\n';
  output += `\nTotal distance :${this.distance}\nChanges :${this.changes}\n`;
  output += `Passing through: ${this.stations.join(', ')}`;
  return output;
};

/**
 *
 * @param {string} fileName The function receives the file name of the railway
        network for which a graph will be built
 */
const network = (fileName) => {
  const graph = {};
  try {
    const railwayObject = readData(fileName);
    if (railwayObject != null) {
      getRoutes().forEach((route, i, routes) => {
        route.stops.forEach((stop) => {
          let currentStation;
          if (stop.stationName in graph) {
            currentStation = graph[stop.stationId];
          } else {
            currentStation = new Station(stop.number, stop.stationName);
            graph[stop.stationId] = currentStation;
          }
          const previous = new Link(null, null, stop.distanceToPrev);
          const next = new Link(null, null, distanceToNext);
          currentStation.addLink(previous);
          currentStation.addLink(next);
        });
      });
    }
  } catch (error) {
    // raise error for other person to handle
    throw error;
  }
};

/**
 *
 *
 * @param {object} graph The graph built by the network method.
 * @param {string} origin The name of the origin station (where a journey
        begins).
 * @param {string} destination The name of the destination station (where a
        journey ends).
 * @param {number} maxResults The maximum number of results to return.
 */
const getBestRoute = (graph, origin, destination, maxResults) => {};

/**
 *
 * @param {Graph} graph The graph built by the network method.
 * @param {!Station} origin The origin station object.
 * @param {!Destination} destination The destination station object.
 * @param {!Journe} journey A journey object to store the current progress.
 * @param {!Array<Route>} routesFound A reference to an array in which to store
 * completed routes.
 * @param {string} routeName The name of the route just travelled on prior to
   arriving at this function invocation.
 */
const doGetBestRoute = (graph, origin, destination, journey, routesFound, routeName) => {};

/**
 *
 * @param {!Array<Journey>} journiesFound An array of completed journeys.
 */
const displayRoutes = (journiesFound) => {};

/**
 * The main function will receive four command line parameters. The filename,
   the name of the origin station, the name of the destination station, the
   maximum number of results to return. If the parameters are invalid, this
   function should inform the user with a usage error: Error! Usage: node
   network.js <data set> <origin> <destination> <max results> If the parameters
   are found to be valid then you should call the necessary functions to build
   the graph, find the best routes and display the results.
 */
const main = () => {};
