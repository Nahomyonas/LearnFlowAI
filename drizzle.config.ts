import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts", // Path to your Drizzle schema file
  out: "./drizzle",             // Folder where migrations will be generated
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Uses your .env Postgres connection
  },
  verbose: true, // optional: shows executed SQL in console
  strict: true,  // optional: enables stricter validation
});