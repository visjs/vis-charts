module.exports = {
  env: {
    browser: true,
    es6: true,
    mocha: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',

    // @TODO: Forces overloaded methods to have docs between overloads and the implementation.
    // I don't like it but it doesn't seem to break anything.
    // Keeping for now.
    'require-jsdoc': [
      'error',
      {
        require: {
          ArrowFunctionExpression: false,
          ClassDeclaration: true,
          FunctionDeclaration: true,
          FunctionExpression: false,
          MethodDefinition: true,
        },
      },
    ],

    // @TODO: Seems to work just fine but I'm not 100 % sure.
    // Anything like this for tsdoc?
    'valid-jsdoc': [
      'error',
      {
        prefer: {
          arg: 'param',
          argument: 'param',
          return: 'returns',
        },
        requireParamDescription: true,
        requireParamType: false,
        requireReturn: true,
        requireReturnDescription: true,
        requireReturnType: false,
      },
    ],
  },
}
