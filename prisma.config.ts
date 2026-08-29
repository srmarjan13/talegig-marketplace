import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // schema পাথটি আপনার প্রজেক্ট স্ট্রাকচার অনুযায়ী ঠিক আছে
  schema: "prisma/schema.prisma",
  
  // Migrations এর জন্য যদি প্রয়োজন হয় তবেই রাখুন, 
  // তবে 'db push' এর জন্য এটি বাধ্যতামূলক নয়
  migrations: {
    path: "prisma/migrations",
  },
  
  // Datasource এর ক্ষেত্রে সরাসরি url প্রপার্টিটি ব্যবহার করুন
  datasource: {
    url: process.env.DATABASE_URL,
  },
});