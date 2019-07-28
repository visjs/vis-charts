// utils
import util from 'vis-util';
//vis.util = util;

// data
import { DataSet, DataView, Queue } from 'vis-data';

// // Network.
// var { Network, Images, dotparser, gephiParser, allOptions } = require('vis-network');
// vis.Network = Network;
// vis.network = { Images, dotparser, gephiParser, allOptions };
// vis.network.convertDot   = function (input) {return vis.network.dotparser.DOTToGraph(input)};
// vis.network.convertGephi = function (input,options) {return vis.network.gephiParser.parseGephi(input,options)};

// // Graph3d
// var { Graph3d, graph3d, Camera, Filter, Point2d, Point3d, Slider, StepNumber } = require('vis-graph3d');
// vis.Graph3d = Graph3d;
// vis.graph3d = { graph3d, Camera, Filter, Point2d, Point3d, Slider, StepNumber };

// Timeline
import { Timeline, Graph2d, timeline } from 'vis-timeline';
// vis.Timeline = Timeline;
// vis.Graph2d = Graph2d;
// vis.timeline = timeline;

// misc
import { DOMutil, keycharm, moment, Hammer } from 'vis-timeline';
// vis.DOMutil = DOMutil;
// vis.keycharm = keycharm;
// vis.moment = moment;
// vis.Hammer = Hammer;

export default {
	util, 

	DataSet, 
	DataView, 
	Queue,

	Timeline, Graph2d, timeline,

	DOMutil, keycharm, moment, Hammer
};