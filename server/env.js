import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Load server/.env before any module reads process.env at import time.
const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, ".env"), quiet: true });
