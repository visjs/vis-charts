import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import css from 'rollup-plugin-css-porter';
import { terser } from 'rollup-plugin-terser';
import genHeader from './lib/header';

const plugins = [
	nodeResolve({
		extensions: ['.ts', '.js', '.json']
	}),
	typescript({
		tsconfig: 'tsconfig.code.json',
		abortOnError: false
	}),
	commonjs(),
	babel({
		extensions: ['.ts', '.js'],
		runtimeHelpers: true
	}),
	css({
		minified: false,
		raw: 'dist/vis.css',
	}),
]
const minPlugins = [
	...plugins.slice(0, -1),
	css({
		minified: 'dist/vis.min.css',
		raw: false,
	}),
	// Note: mangling consumes way too much memory on such a big project.
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
