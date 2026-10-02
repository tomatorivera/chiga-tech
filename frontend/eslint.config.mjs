// ESLint solo cubre seguridad; el lint general lo hace oxlint (.oxlintrc.json).
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import security from "eslint-plugin-security";

export default defineConfig(
  {
    ignores: ["dist/**", "coverage/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
    },
    extends: [security.configs.recommended],
    rules: {
      "security/detect-object-injection": "off",
    },
  },
);
