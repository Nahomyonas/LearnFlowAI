import DashboardPageClient from "@/components/dashboard/DashboardClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() }); // server-side check
    if (!session) {
      // Use a server redirect to signin if you prefer:
      const { redirect } = await import("next/navigation");
      redirect("/signin");
    }
  return <DashboardPageClient />;
}
