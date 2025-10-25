import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateCourseOutline } from "@/components/dashboard/CreateCourseOutline";

export default async function CreateCourseOutlinePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/signin");
  }
  return <CreateCourseOutline />;
}
