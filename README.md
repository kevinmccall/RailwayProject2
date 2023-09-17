# Railway System

# Author: Kevin McCall

This is a program that loads in data from a JSON file about railways and
performs an analysis on the data. It can print formatted information about
different routes of railway stations, find the shortest distance between two
stops, provide synopses, etc. The file network.js builds a graph and finds the best routes between multiple stops.

# Usage

run the command `node network.js <filename> <starting station> <ending station> <number of routes>`

- filename is the path to the json file containing the railway data structure.
- starting station is a string containing the name of the starting station
- starting station is a string containing the name of the ending station
- number of routes is the number of best routes returned at maximum

# Testing

- To run tests, use the command `npm run tests`
- To see the test coverage, use the command `npm run htmlcoverage`

# Functions

- network
  - Creates graph to analyze best routes between stations
- main
  - Entry point to the program
- getBestRoute
  - Returns an array of the best routes sorted by changes then distance traveled.

# Issues / Bugs

- While testing, line 139 and 180 of network.js are reported as not covered,
  however, the test in network titled 'should throw a TypeError error if
  fileName is the wrong data type' covers this use case.
- The dataset 'londish.json' has repeated stations (Bankside repeated),
  incorrectly names stations (Stratford -> Statford), and there is no way to
  tell the routes with cycles apart from regular routes because the londish.json
  doesn't close the cycles (no way to tell that Hackney connects to King's Cross
  for example - Hackney ends abruptly without connecting back to Kings Cross)
  - I ended up creating my own railway network for testing called
    'kevin_railway.js' to test for cycles
