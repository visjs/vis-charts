import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import genHeader from './lib/header';

const plugins = [
	nodeResolve({
		extensions: ['.ts', '.js', '.json']
	}),
	commonjs(),
	babel({
		extensions: ['.ts', '.js'],
		runtimeHelpers: true
	})
]
const minPlugins = [
	...plugins.slice(),
	// Note: mangling consumes way too much memory on such a big project.
	minify({ comments: false, mangle: false })
]

export default [{
	input: 'index.js',
	output: {
		file: 'dist/vis.js',
		name: 'vis',
		exports: 'default',
		format: 'umd',
		sourcemap: true,
		banner: genHeader(),
	},
	plugins: plugins,
}, {
	input: 'index.js',
	output: {
		file: 'dist/vis.min.js',
		name: 'vis',
		exports: 'default',
		format: 'umd',
		banner: genHeader(),
	},
	plugins: minPlugins,
}]
