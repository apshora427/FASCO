import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import { handleStripeWebhook } from "./controllers/payment.controller.js";
import { uploadsDirectory } from "./utils/uploadStorage.js";

const isLocalDevelopmentOrigin = (origin) => {
  if (env.isProduction) return false;
  try {
    const url = new URL(origin);
    return (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

// The express app, separate from the listener so tests can mount it directly.
export const createApp = () => {
  const app = express();

  app.set("trust proxy", env.trustProxy);
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
  }));
  app.post(
    `${env.apiPrefix}/payments/webhook`,
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(
    "/uploads",
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(uploadsDirectory, { dotfiles: "deny", index: false })
  );
  app.use(requestLogger);

  // feature routes: /api/v1/*
  app.use(env.apiPrefix, apiRouter);

  // unmatched routes → 404 JSON, any thrown error → error middleware
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
