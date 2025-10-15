import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"], 
  out: "./drizzle",             // Folder where migrations will be generated
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, 
  },
  verbose: true, // optional: shows executed SQL in console
  strict: true,  // optional: enables stricter validation
});