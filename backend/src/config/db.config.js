import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { env } from "./env.js";

// Dev fallback stores its files in backend/.mongo-data so products survive a
// restart. Set MONGODB_URI in .env to point at a real MongoDB instead.
const dataDir = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../.mongo-data");

let memoryServer = null;

// Never let mongoose silently fall back to the implicit "test" database: if the
// URI has no database name (e.g. "mongodb://localhost:27017"), append ours.
const withDbName = (uri) => {
  const normalized = uri.replace(/\/+$/, "");
  const hasDbName = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]+\/[^/]+/.test(normalized);
  return hasDbName ? uri : `${normalized}/fasco`;
};

export const connectDB = async () => {
  let uri = env.mongoUri;

  if (!uri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    fs.mkdirSync(dataDir, { recursive: true });
    memoryServer = await MongoMemoryServer.create({
      instance: { dbPath: dataDir, storageEngine: "wiredTiger" },
    });
    uri = memoryServer.getUri();
    console.log(
      "MONGODB_URI not set — using embedded dev database (backend/.mongo-data). " +
        "Set MONGODB_URI in .env to use a real MongoDB."
    );
  }

  await mongoose.connect(withDbName(uri));
  console.log("MongoDB connected");
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};