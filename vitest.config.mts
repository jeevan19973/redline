import { defineConfig } from "vitest/config";

// The deterministic suite: the Analysis module driven by a scripted fake
// model client, in Node, with no API key (spec, Testing Decisions).
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
