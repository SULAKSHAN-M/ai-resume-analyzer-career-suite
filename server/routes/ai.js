import { Router } from "express";
import { getAIRouterStatus } from "../lib/modelRouter.js";

export const aiRouter = Router();

// No keys or secrets are exposed here; this endpoint only reports the configured
// model pool, routing order, and in-process success/failure counters.
aiRouter.get("/status", (req, res) => {
  res.json({ ai: getAIRouterStatus() });
});
