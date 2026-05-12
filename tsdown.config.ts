import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  unbundle: true,
  outputOptions: {
    comments: { jsdoc: false }, // removes jsdoc comments from JS output, keeps them in TS
  },

  env: { TEST: false },

  platform: "neutral",
  format: "esm",
  dts: { tsgo: true },
  fixedExtension: true,
  minify: "dce-only",
})
