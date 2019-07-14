import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

const babelConfingBase = {
  extensions: ['.mts', '.ts', '.tsx', '.mjs', '.js', '.jsx'],
}
const resolveConfig = {
  extensions: [...babelConfingBase.extensions, '.json', '.node'],
}

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm.js',
      format: 'esm',
    },
    plugins: [resolve(resolveConfig), babel(babelConfingBase)],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd.js',
      format: 'umd',
      name: 'vis',
    },
    plugins: [resolve(resolveConfig), babel(babelConfingBase)],
  }
]
