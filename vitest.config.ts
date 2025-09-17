import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        fileParallelism: false,
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
        },
    },
});
