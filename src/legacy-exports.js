const defaultExport = {};

/*
 * Simply export them all. It's pretty much the same as loading all of them
 * using script tags in HTML.
 */

export * from "vis-data/esnext";
import * as nsData from "vis-data/esnext";
Object.assign(defaultExport, nsData);

export * from "vis-graph3d/esnext";
import * as nsGraph3d from "vis-graph3d/esnext";
Object.assign(defaultExport, nsGraph3d);

export * from "vis-network/esnext";
import * as nsNetwork from "vis-network/esnext";
Object.assign(defaultExport, nsNetwork);

export * from "vis-timeline/esnext";
import * as nsTimeline from "vis-timeline/esnext";
Object.assign(defaultExport, nsTimeline);

/*
 * Sideeffects required for all of the functions of individual projects to work.
 */

import "vis-network/styles/vis-network.css";

import "moment/locale/de";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/it";
import "moment/locale/ja";
import "moment/locale/nl";
import "moment/locale/pl";
import "moment/locale/ru";
import "moment/locale/uk";
import "vis-timeline/styles/vis-timeline-graph2d.css";

/*
 * Restore legacy treeshaking immune network export from Vis Network.
 */

import {
  NetworkImages,
  networkDOTParser,
  networkGephiParser,
  networkOptions,
  parseDOTNetwork,
  parseGephiNetwork,
} from "vis-network/esnext";
export const network = {
  Images: NetworkImages,
  dotparser: networkDOTParser,
  gephiParser: networkGephiParser,
  allOptions: networkOptions,
  convertDot: parseDOTNetwork,
  convertGephi: parseGephiNetwork,
};
defaultExport.network = network;

/*
 * Leak internal Vis Util helper functions.
 */

import * as util from "vis-util/esnext";
export { util };
defaultExport.util = util;

/*
 * Reexport bundled external libraries.
 */

import * as moment from "./deprecated/moment";
export { moment };
defaultExport.moment = moment;

import * as Hammer from "./deprecated/hammer";
export { Hammer };
defaultExport.Hammer = Hammer;

import * as keycharm from "keycharm";
export { keycharm };
defaultExport.keycharm = keycharm;

/*
 * Default export to cover issues with various ways of importing.
 */

export default defaultExport;
