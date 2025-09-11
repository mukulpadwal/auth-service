import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rsaPemToJwk from "rsa-pem-to-jwk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKey = fs.readFileSync(
    path.join(__dirname, "../certs/privateKey.pem")
);
const jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");

const jwks = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../public/.well-known/jwks.json"))
);

jwks.keys.push(jwk);

fs.writeFileSync(
    path.join(__dirname, "../public/.well-known/jwks.json"),
    JSON.stringify(jwks),
    { encoding: "utf-8" }
);
