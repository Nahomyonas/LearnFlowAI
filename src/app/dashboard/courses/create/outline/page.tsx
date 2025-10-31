import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateCourseOutline } from "@/components/dashboard/CreateCourseOutline";

type CreateCourseOutlinePageProps = {
  searchParams: { briefId?: string };
};

export default async function CreateCourseOutlinePage({ searchParams }: CreateCourseOutlinePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/signin");
  }
  const briefId = searchParams?.briefId || undefined;
  return <CreateCourseOutline briefId={briefId} />;
}
