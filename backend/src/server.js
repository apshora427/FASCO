import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.config.js";
import { Product } from "./models/product.model.js";
import { User } from "./models/user.model.js";
import { ensureSeedProducts } from "./data/products.seed.js";
import { ensureSeedCategories, ensureSeedCoupons } from "./data/store.seed.js";
import { ensureAdmin } from "./data/admin.seed.js";

// database first — the API never serves requests against a half-ready store
try {
  await connectDB();
  await ensureSeedProducts(Product);
  await ensureSeedCategories();
  await ensureSeedCoupons();
  await ensureAdmin(User); // dashboard owner, from ADMIN_EMAIL / ADMIN_PASSWORD
} catch (err) {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
}

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`FASCO API listening on http://localhost:${env.port}${env.apiPrefix}`);
  console.log(`Health check → http://localhost:${env.port}${env.apiPrefix}/health`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${env.port} is already in use — stop the other process or set PORT in .env`);
    process.exit(1);
  }
  throw err;
});
