import banner from 'rollup-plugin-banner';
import commonjs from 'rollup-plugin-commonjs';
import genHeader from './lib/header';
import minify from 'rollup-plugin-babel-minify';
import { globals } from './rollup.common'

const name = process.env.NAME
const header = genHeader(process.env.HEADER)

export default {
	input: `dist/${name}.js`,
	output: {
		file: `dist/${name}.min.js`,
		name: 'vis',
		exports: 'default',
		globals,
		format: 'umd'
	},
	plugins: [
		commonjs(),
		minify({
			comments: false
		}),
		banner(header),
	]
}
