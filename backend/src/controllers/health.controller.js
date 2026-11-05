import mongoose from "mongoose";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const startedAt = Date.now();

// GET /api/v1/health — liveness probe that also demonstrates the response
// envelope every endpoint uses: { success: true, ... }.
export const getHealth = (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
};

export const getReadiness = asyncHandler(async (_req, res) => {
  const checks = {
    database: { status: "unavailable", topology: "unknown" },
    email: { status: env.smtp.user && env.smtp.pass ? "configured" : "not_configured" },
  };
  let ready = mongoose.connection.readyState === 1 && Boolean(mongoose.connection.db);

  if (ready) {
    try {
      const hello = await mongoose.connection.db.admin().command({ hello: 1 });
      if (hello.msg === "isdbgrid") {
        checks.database = { status: "up", topology: "sharded_cluster" };
      } else if (hello.setName) {
        checks.database = { status: "up", topology: "replica_set" };
      } else {
        checks.database = { status: "up", topology: "standalone" };
        ready = false;
      }
    } catch (error) {
      console.error("[health] Database readiness check failed:", error.message);
      ready = false;
    }
  }

  if (ready && checks.database.status === "unavailable") {
    checks.database = { status: "unavailable", topology: "unknown" };
  }

  res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? "ready" : "not_ready",
    checks,
    timestamp: new Date().toISOString(),
  });
});
