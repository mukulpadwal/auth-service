import { execSync } from "child_process";
import fs from "fs";

const envFile = `.env.${process.env.NODE_ENV || "dev"}`;
fs.copyFileSync(envFile, ".env");

execSync(`npx prisma ${process.argv.slice(2).join(" ")}`, {
    stdio: "inherit",
});
