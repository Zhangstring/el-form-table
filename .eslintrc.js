module.exports = {
    root: true,
    "env": {
        "browser": true
    },
    "extends": "standard",
    parserOptions: {
      parser: 'babel-eslint'
    },
    rules: {
      semi: [0],
      // always-multiline：多行模式必须带逗号，单行模式不能带逗号
      'comma-dangle': [2, 'never'],
      'no-console': 'off'
    },
};