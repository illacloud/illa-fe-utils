module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  extends: [
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  plugins: ["@typescript-eslint/eslint-plugin", "import"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
  },
  rules: {
    "import/default": "off",
  },
}