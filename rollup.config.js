import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import genHeader from './lib/header';

const plugins = [
	nodeResolve({
		extensions: ['.js', '.json']
	}),
	commonjs({
		namedExports: {
			'timsort': ['sort'] // Autodetection fails here.
		}
	}),
	babel({
		extensions: ['.ts', '.js'],
		runtimeHelpers: true
	}),
	postcss({
		extract: 'dist/vis.css',
		inject: false,
		minimize: false,
		sourceMap: true
	}),
]
const minPlugins = [
	...plugins.slice(0, -1),
	postcss({
		extract: 'dist/vis.min.css',
		inject: false,
		minimize: true,
		sourceMap: true
	}),
	terser({
		output: {
			comments: (_node, { value }) => /@license/.test(value)
		}
	})
]

export default [{
	input: 'src/index.ts',
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
	input: 'src/index.ts',
	output: {
		file: 'dist/vis.min.js',
		name: 'vis',
		exports: 'default',
		format: 'umd',
		sourcemap: true,
		banner: genHeader(),
	},
	plugins: minPlugins,
}]
