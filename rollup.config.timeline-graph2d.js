import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';
import banner from 'rollup-plugin-banner';
import genHeader from './lib/header';
import { globals } from './rollup.common'

const genSourceMap = false;

export default [{
	input: 'index-timeline-graph2d.js',
	output: {
		file: 'dist/vis-timeline-graph2d.js',
		name: 'vis',
		exports: 'named',
		globals,
		format: 'umd',
		sourcemap: genSourceMap
	},
	plugins: [
		commonjs(),
		nodeBuiltins(),
		nodeResolve(),
		babel(),
		sourcemaps(),
		banner(genHeader('timeline/graph2d'))
	]
}]
