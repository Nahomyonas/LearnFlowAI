import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FillCourseContent } from "@/components/dashboard/FillCourseContent";

export default async function FillCourseContentPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/signin");
  }
  return <FillCourseContent />;
}
