import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { User } from '../models/user.model.js';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const main = async () => {
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const email = (process.env.ADMIN_EMAIL || 'admin@fasco.com').toLowerCase();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    existing.role = 'admin';
    existing.isVerified = true;
    existing.password = bcrypt.hashSync(password, 10);
    await User.findByIdAndUpdate(existing._id, existing);
    console.log('Admin synced:', email);
  } else {
    await User.create({ name: 'FASCO Admin', email, password: bcrypt.hashSync(password, 10), role: 'admin', isVerified: true });
    console.log('Admin seeded:', email);
  }
};

main().catch((e) => { console.error('seedAdmin failed:', e.message); process.exit(1); });
