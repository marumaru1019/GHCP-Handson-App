import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 📝 console.* の直接使用を禁止し、ロガーユーティリティの使用を強制
      "no-console": "error",
    },
  },
  {
    // 🚫 ロガーファイル自体は例外として許可
    files: ["**/logger.ts", "**/logger.js"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
