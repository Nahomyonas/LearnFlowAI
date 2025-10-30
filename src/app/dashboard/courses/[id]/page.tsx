import { CoursePage } from '@/components/dashboard/CoursePage';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function CourseDashboardPage() {

  const session = await auth.api.getSession({ headers: await headers() }) // server-side check
  if (!session) {
    // Use a server redirect to signin if you prefer:
    const { redirect } = await import('next/navigation')
    redirect('/signin')
  }

  return <CoursePage/>
}
