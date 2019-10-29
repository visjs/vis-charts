// utils
import * as util from 'vis-util';

// data
import { DataSet, DataView, Queue } from 'vis-data';

// Network
import {
	Network,
	NetworkImages,
	networkDOTParser,
	networkGephiParser,
	networkOptions,
	parseDOTNetwork,
	parseGephiNetwork
} from 'vis-network/peer/esm/vis-network.min';
const network = {
	Images: NetworkImages,
	allOptions: networkOptions,
	convertDot: parseDOTNetwork,
	convertGephi: parseGephiNetwork,
	dotparser: networkDOTParser,
	gephiParser: networkGephiParser
};

// Graph3d
import { Graph3d, graph3d } from '../node_modules/vis-graph3d/index';

// Timeline
import { Timeline, Graph2d, timeline } from '../node_modules/vis-timeline/index';

// misc
import { DOMutil, keycharm, moment, Hammer } from '../node_modules/vis-timeline/index';

export default {
	util,

	DataSet,
	DataView,
	Queue,

	Network, network,

	Graph3d, graph3d,

	Timeline, Graph2d, timeline,

	DOMutil, keycharm, moment, Hammer
};
