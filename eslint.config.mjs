import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Disable unused vars check
      "react/no-unescaped-entities": "off", // Disable unescaped entities check
      "@typescript-eslint/no-explicit-any": "off", // Disable any type check
    },
  },
];

export default eslintConfig;
