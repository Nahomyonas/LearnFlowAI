import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Expose Better Auth’s built-in endpoints (sign-in, sign-up, session, etc.)
export const { GET, POST } = toNextJsHandler(auth.handler);
