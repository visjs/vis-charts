import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

// This is necessary for Moment to work.
import commonjs from 'rollup-plugin-commonjs'

const babelConfingBase = {
  extensions: ['.ts', '.js'],
  runtimeHelpers: true,
}
const resolveConfig = {
  extensions: [...babelConfingBase.extensions, '.json'],
}

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm.js',
      format: 'esm',
    },
    plugins: [resolve(resolveConfig), commonjs(), babel(babelConfingBase)],
  },
  {
    input: 'src/index.ts',
    output: {
      exports: 'named',
      file: 'dist/umd.js',
      format: 'umd',
      name: 'vis',
    },
    plugins: [resolve(resolveConfig), commonjs(), babel(babelConfingBase)],
  },
]
