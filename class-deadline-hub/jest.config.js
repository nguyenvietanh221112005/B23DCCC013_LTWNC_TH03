const nextJest = require("next/jest");

// next/jest tự cấu hình SWC để biên dịch TypeScript, không cần ts-jest hay babel.
const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "node",
  testMatch: ["<rootDir>/lib/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
});
