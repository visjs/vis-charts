import packageJSON from "./package.json";
import { generateRollupConfiguration } from "vis-dev-utils";

export default generateRollupConfiguration({
  externalForPeerBuild: ["moment"],
  globals: {
    "@egjs/hammerjs": "Hammer",
    "component-emitter": "Emitter",
    "propagating-hammerjs": "propagating",
    "vis-data": "vis",
    "vis-util": "vis",
    keycharm: "keycharm",
    moment: "moment",
    timsort: "timsort",
    uuid: "uuid"
  },
  header: { name: "vis-charts" },
  libraryFilename: "vis-charts",
  entryPoints: "./src",
  packageJSON
});
