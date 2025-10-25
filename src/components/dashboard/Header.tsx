"use client";
import MeMenu from "./MeMenu";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const name = session?.user?.name || session?.user?.email || "";
  const email = session?.user?.email || undefined;
  const avatarUrl = (session?.user as any)?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah";

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-white">LF</span>
          </div>
          <div>
            <h1 className="text-gray-900">LearnFlow AI</h1>
            <p className="text-sm text-gray-500">Smart Learning Assistant</p>
          </div>
        </div>

        <MeMenu
          name={name || " "}
          subtitle={email}
          avatarUrl={avatarUrl}
          onLogout={async () => {
            try {
              await signOut();
              router.replace("/signin");
            } catch {
              // no-op
            }
          }}
        />
      </div>
    </header>
  );
}
