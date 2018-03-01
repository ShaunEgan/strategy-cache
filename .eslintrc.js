module.exports = {
  'env': {
    'es6': true,
    'node': true,
    'jasmine': true
  },
  'plugins': [
    'import'
  ],
  'settings': {
    'import/resolve': {
      'node': {
        'moduleDirectory': ['src/']
      }
    }
  },
  'extends': [
    'plugin:import/errors',
    'plugin:import/warnings',
    'airbnb-base'
  ],
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'max-len': [
      'error',
      120
    ],
    'semi': [
      'error',
      'never'
    ],
    'comma-dangle': [
      'error',
      'never'
    ],
    'arrow-parens': [
      'error',
      'as-needed'
    ],
    'space-before-function-paren': [
      'error',
      'always'
    ],
    'no-underscore-dangle': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-named-default': 'off',
    'no-console': 'off',
    'no-process-exit': 'off'
  }
}
