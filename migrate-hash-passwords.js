// এই স্ক্রিপ্টটা একবারই রান করতে হবে — DB-তে থাকা পুরনো plaintext password গুলোকে
// bcrypt hash-এ কনভার্ট করার জন্য। bcrypt.js যোগ করার পর, deploy করার আগে এটা রান করুন।
//
// রান করার নিয়ম:
//   node migrate-hash-passwords.js
//
// ⚠️ চালানোর আগে অবশ্যই DB backup নিয়ে নিন।
// ⚠️ এই স্ক্রিপ্ট শুধু একবারই চালাবেন। দ্বিতীয়বার চালালে already-hashed
//    password আবার hash হয়ে যাবে এবং login ভেঙে যাবে (এজন্য নিচে একটা
//    detection guard রাখা হয়েছে যা bcrypt hash prefix "$2" চেক করে)।

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

// bcrypt hash সবসময় "$2a$", "$2b$", বা "$2y$" দিয়ে শুরু হয়
function isAlreadyHashed(password) {
  return typeof password === 'string' && /^\$2[aby]\$/.test(password);
}

async function migrateTable(modelName, prismaModel) {
  const records = await prismaModel.findMany();
  let updated = 0;
  let skipped = 0;

  for (const record of records) {
    if (!record.password || isAlreadyHashed(record.password)) {
      skipped++;
      continue;
    }
    const hashed = await bcrypt.hash(record.password, SALT_ROUNDS);
    await prismaModel.update({
      where: { id: record.id },
      data: { password: hashed },
    });
    updated++;
  }

  console.log(`[${modelName}] Updated: ${updated}, Skipped (already hashed / empty): ${skipped}`);
}

async function main() {
  console.log('Password hashing migration শুরু হচ্ছে...');

  await migrateTable('User', prisma.user);
  await migrateTable('Admin', prisma.admin);

  console.log('Migration সম্পন্ন হয়েছে।');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Migration ব্যর্থ হয়েছে:', err);
  await prisma.$disconnect();
  process.exit(1);
});
