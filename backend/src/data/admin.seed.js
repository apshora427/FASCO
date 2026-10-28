import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

// Boots the first admin from ADMIN_EMAIL / ADMIN_PASSWORD in .env so the
// dashboard has an owner without anyone hand-writing a Mongo document.
// Idempotent: re-running promotes/keeps the seeded account, never duplicates.
export const ensureAdmin = async (User) => {
  if (!env.adminPassword) {
    console.warn("ADMIN_PASSWORD not set in .env — skipping admin seed");
    return null;
  }

  const email = env.adminEmail.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    let changed = false;
    if (existing.role !== "admin" || !existing.isVerified) {
      existing.role = "admin";
      existing.isVerified = true;
      changed = true;
    }
    // .env owns this account's password — rotate it if it drifted
    if (!bcrypt.compareSync(env.adminPassword, existing.password)) {
      existing.password = bcrypt.hashSync(env.adminPassword, 10);
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log(`Admin account synced from .env → ${email}`);
    }
    return existing;
  }

  const admin = await User.create({
    name: "FASCO Admin",
    email,
    password: bcrypt.hashSync(env.adminPassword, 10),
    role: "admin",
    isVerified: true,
  });
  console.log(`Admin account seeded → ${admin.email}`);
  return admin;
};