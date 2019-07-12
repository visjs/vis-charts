var util = require('vis-util');

// utils
exports.util = util;
exports.DOMutil = require('./lib/DOMutil');

// data
util.extend(exports, require('vis-data'));

// Network
exports.Network = require('./lib/network/Network');
exports.network = {
  Images: require('./lib/network/Images'),
  dotparser: require('./lib/network/dotparser'),
  gephiParser: require('./lib/network/gephiParser'),
  allOptions: require('./lib/network/options')
};
exports.network.convertDot   = function (input) {return exports.network.dotparser.DOTToGraph(input)};
exports.network.convertGephi = function (input,options) {return exports.network.gephiParser.parseGephi(input,options)};

// bundled external libraries
exports.moment = require('./lib/module/moment');
exports.Hammer = require('./lib/module/hammer');
exports.keycharm = require('keycharm');