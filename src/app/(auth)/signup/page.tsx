"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
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
      await signUp.email({ name, email, password }); // Better Auth built-in
      router.replace("/dashboard");
    } catch (e: any) {
      setMsg(e?.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create account</h1>
      {msg && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{msg}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-md border px-3 py-2" placeholder="Name"
               value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2" placeholder="Email" type="email"
               value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-40"
                disabled={loading || !email || !password || !name}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-3 text-sm text-gray-600">
        Already have an account? <a className="underline" href="/signin">Sign in</a>
      </p>
    </div>
  );
}