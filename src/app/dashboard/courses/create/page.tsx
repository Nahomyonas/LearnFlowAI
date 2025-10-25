import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateCourseBrief } from "@/components/dashboard/CreateCourseBrief";

export default async function CreateCoursePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/signin");
  }
  return <CreateCourseBrief />;
}
