import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactNativePlugin from "eslint-plugin-react-native";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "android/",
      "ios/",
      ".expo/",
      "dist/",
      "build/",
      "__mocks__/",
      "babel.config.js",
      "jest.config.js",
      "jest.setup.js",
      "scripts/",
    ],
  },

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // React (flat config)
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],

  // React Hooks (classic essential rules only — React Compiler rules can be enabled incrementally)
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // React Native
  {
    plugins: {
      "react-native": reactNativePlugin,
    },
    rules: {
      "react-native/no-unused-styles": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "off",
      "react-native/no-raw-text": "off",
    },
  },

  // Project-specific settings
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Console usage
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // React
      "react/prop-types": "off",
      "react/display-name": "off",
    },
  },

  // Test file overrides
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Prettier must be last — disables conflicting formatting rules
  eslintConfigPrettier
);
