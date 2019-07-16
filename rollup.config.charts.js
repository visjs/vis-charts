import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import banner from 'rollup-plugin-banner';
import genHeader from './lib/header';
import { globals } from './rollup.common'

export default [{
	input: 'index.js',
	output: {
		file: 'dist/vis.js',
		name: 'vis',
		exports: 'default',
		globals,
		format: 'umd'
	},
	plugins: [
		commonjs(),
		nodeBuiltins(),
		nodeResolve(),
		babel(),
		banner(genHeader())
	]
}]
