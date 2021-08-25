module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        'plugin:cypress/recommended',
        '@vue/standard'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-useless-escape': 'off',
        'no-eval': 'off',
        'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
        'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
        'space-before-function-paren': ['error', {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'always'
        }],
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
        'eol-last': ['error', 'never'],
        'no-control-regex': 'warn',
        'cypress/no-unnecessary-waiting': 'off',
        camelcase: [0, { properties: 'never' }],
        indent: ['error', 4],
        curly: ['error', 'multi-or-nest']
    }
}