import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        fileParallelism: false,
        maxConcurrency: 1,
        testTimeout: 20000,
        coverage: {
            provider: "istanbul",
            reporter: ["text", "lcov"],
            include: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
        },
    },
});
