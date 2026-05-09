import { defineConfig } from "vitest/config"

export default defineConfig({
  // experimental: { preParse: true },
  test: {
    experimental: {
      viteModuleRunner: false,
    },
  },
})
