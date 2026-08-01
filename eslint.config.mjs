import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["scripts/**/*.mjs", "scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/components/cms/HeroVideoManager.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "next-env.d.ts",
    ".bayan-backups/**",
    "backups/**",
    ".bayan-validation/**",
    "**/._*",
    "**/.DS_Store",
    "**/*.backup.*",
    "**/*.bak",
    "**/*.before-*",
    "**/*.backup.*",
    "**/*.bak",
    "**/*.before-*",
  ]),
]);
