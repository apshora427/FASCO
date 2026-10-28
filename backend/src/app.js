import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

// The express app, separate from the listener so tests can mount it directly.
export const createApp = () => {
  const app = express();

  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json());
  app.use(requestLogger);

  // feature routes: /api/v1/*
  app.use(env.apiPrefix, apiRouter);

  // unmatched routes → 404 JSON, any thrown error → error middleware
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
