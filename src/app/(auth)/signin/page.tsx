"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await signIn.email({ email, password }); // Better Auth built-in
      router.replace("/dashboard");
    } catch (e: any) {
      setMsg(e?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      {msg && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{msg}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-md border px-3 py-2" placeholder="Email" type="email"
               value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-40"
                disabled={loading || !email || !password}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-3 text-sm text-gray-600">
        Don’t have an account? <a className="underline" href="/signup">Create one</a>
      </p>
    </div>
  );
}
