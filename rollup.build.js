import packageJSON from "./package.json" with { type: "json" };
import { generateRollupConfiguration } from "vis-dev-utils";

// Note: This is used only for simplicity of maintenance. Only the "peer" build
// is going to be used and it won't have any peer dependencies.
export default generateRollupConfiguration({
  externalForPeerBuild: [],
  globals: {},
  header: { name: "vis-charts" },
  libraryFilename: "vis-charts",
  entryPoints: "./src",
  packageJSON,
});
