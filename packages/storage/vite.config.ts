import typescript from "@rollup/plugin-typescript"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    sourcemap: true,
    minify: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "@illa-fe-utils/storage",
      fileName: (format) => `${format}/index.js`,
    },
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "../../tsconfig.json"),
          rootDir: path.resolve(__dirname, "src"),
          declaration: true,
          outDir: path.resolve(__dirname, "dist/types"),
        }),
      ],
    },
  },
})
