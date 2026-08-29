const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testLogin() {
  const email = "superadmin@talegig.com";
  const password = "TaleGig123";

  console.log("Testing login for:", email);

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  const isMatch = admin ? await bcrypt.compare(password, admin.password) : false;

  if (admin && isMatch) {
    console.log("Success! Login credentials verified.");
  } else {
    console.log("Failed! Invalid credentials.");
  }

  await prisma.$disconnect();
}

testLogin();