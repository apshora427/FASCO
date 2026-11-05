import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { env } from "./env.js";

// The embedded development database keeps its files in backend/.mongo-data.
const dataDir = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../.mongo-data");
const embeddedMongoPort = 27018;
const embeddedReplicaSetName = "testset";

let memoryServer = null;

// Never let mongoose silently fall back to the implicit "test" database: if the
// URI has no database name (e.g. "mongodb://localhost:27017"), append ours.
export const withDbName = (uri) => {
  const queryIndex = uri.indexOf("?");
  const baseUri = queryIndex === -1 ? uri : uri.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : uri.slice(queryIndex);
  const normalized = baseUri.replace(/\/+$/, "");
  const hasDbName = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]+\/[^/]+/.test(normalized);
  return `${hasDbName ? normalized : `${normalized}/fasco`}${query}`;
};

const initializeEmbeddedReplicaSet = async (server) => {
  const client = new mongoose.mongo.MongoClient(server.getUri(), {
    directConnection: true,
    serverSelectionTimeoutMS: 10_000,
  });
  try {
    await client.connect();
    const admin = client.db("admin");
    let existing;
    const configDeadline = Date.now() + 5_000;
    while (!existing && Date.now() < configDeadline) {
      try {
        existing = (await admin.command({ replSetGetConfig: 1 })).config;
      } catch (error) {
        if (error.code !== 94) throw error;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    const host = `127.0.0.1:${embeddedMongoPort}`;
    if (existing) {
      if (existing.members.length !== 1) {
        throw new Error("The embedded development database must contain exactly one replica-set member");
      }
      if (existing.members[0].host !== host) {
        const config = {
          _id: existing._id,
          version: existing.version + 1,
          members: [{ ...existing.members[0], _id: 0, host }],
          settings: existing.settings,
        };
        await admin.command({ replSetReconfig: config, force: true });
      }
    } else {
      await admin.command({
        replSetInitiate: {
          _id: embeddedReplicaSetName,
          members: [{ _id: 0, host }],
          settings: { electionTimeoutMillis: 5000 },
        },
      });
    }

    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const hello = await admin.command({ hello: 1 });
      if (hello.isWritablePrimary) return;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error("Embedded MongoDB replica set did not elect a primary");
  } finally {
    await client.close();
  }
};

export const connectDB = async () => {
  let uri = env.mongoUri;

  if (!uri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    fs.mkdirSync(dataDir, { recursive: true });
    memoryServer = new MongoMemoryServer({
      instance: {
        dbPath: dataDir,
        storageEngine: "wiredTiger",
        replSet: embeddedReplicaSetName,
        ip: "127.0.0.1",
        port: embeddedMongoPort,
        launchTimeout: 30_000,
      },
    });
    await memoryServer.start();
    await initializeEmbeddedReplicaSet(memoryServer);
    uri = `${memoryServer.getUri()}?replicaSet=${embeddedReplicaSetName}`;
    console.log(
      `MONGODB_URI not set — using embedded replica-set dev database on 127.0.0.1:${embeddedMongoPort} (backend/.mongo-data). ` +
        "Set MONGODB_URI in .env to use a replica-set-capable MongoDB."
    );
  }

  try {
    await mongoose.connect(withDbName(uri));
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    if (!hello.setName && hello.msg !== "isdbgrid") {
      throw new Error("MongoDB transactions require a replica set or sharded cluster; configure MONGODB_URI accordingly");
    }
    console.log("MongoDB connected");
  } catch (error) {
    const failedMemoryServer = memoryServer;
    memoryServer = null;
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("Could not close the failed MongoDB connection:", disconnectError.message);
    }
    if (failedMemoryServer) {
      try {
        await failedMemoryServer.stop();
      } catch (stopError) {
        console.error("Could not stop the embedded MongoDB after startup failed:", stopError.message);
      }
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  const server = memoryServer;
  memoryServer = null;
  try {
    await mongoose.disconnect();
  } finally {
    if (server) await server.stop();
  }
};