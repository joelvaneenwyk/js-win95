import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";

export default [
    pluginJs.configs.recommended,
    {
        files: [
            "**/*.{js,cjs}"
        ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            "@typescript-eslint/no-var-requires": "off"
        }
    },
    {
        files: [
            "**/*.mjs"
        ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        parser: "@typescript-eslint/parser",
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        ...tseslint.configs.recommended,
    },
    ...fixupConfigRules(pluginReactConfig)
];
