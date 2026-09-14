import eslint from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "app.js"],
  },
  eslint.configs.recommended,
  {
    files: ["js/**/*.js", "src/**/*.js", "vite.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["error", { "args": "none" }],
    },
  },
];
