/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    verbose: true,
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.ts$": ["ts-jest"],
    },
    moduleFileExtensions: ["ts", "js", "json"],
    testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],
    // collectCoverage: true,
    // coverageProvider: "v8",
    // collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"]
};
