import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client"; // your drizzle instance


// for mock testing 
export async function requireUserId() {
  // TODO: swap with better-auth later
  return "demo-user-1";
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
    }),
});