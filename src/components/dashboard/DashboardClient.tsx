"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { Button } from "@/components/dashboard/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Status = 'draft' | 'published' | 'archived'

type Course = {
  id: string
  title: string
  slug: string
  status: Status
  visibility: 'private' | 'unlisted' | 'public'
  updated_at: string
  goals?: string[] | null // ← add this
}


/* ================
   API helpers
   ================ */
const api = {
  courses: {
    list: async (limit = 20) => {
      const res = await fetch(`/api/courses?limit=${limit}`, {
        cache: 'no-store',
      })
      const j = await res.json()
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to load courses')
      return (j.items ?? []) as Course[]
    },
  }
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  async function loadCourses() {
    setLoading(true)
    setError(null)
    try {
      const items = await api.courses.list(20)
      setCourses(items)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">
                {session?.user?.name || session?.user?.email
                  ? `Welcome back, ${(session?.user?.name || session?.user?.email) ?? ""}! 👋`
                  : "Welcome back! 👋"}
              </h2>
              <p className="text-gray-600">Continue your learning journey or start something new</p>
            </div>

            {/* Create New Course Button */}
            <div className="mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                onClick={() => router.push("/dashboard/courses/create")}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Course
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Courses Grid */}
            <div className="mb-6">
              <h3 className="text-gray-900 mb-4">My Learning Paths</h3>
            </div>
            
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-lg bg-white animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center">
                <p className="text-gray-600 mb-4">No courses yet. Create your first course to get started!</p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => router.push("/dashboard/courses/create")}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Course
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
      </div>
    </DashboardShell>
  );
}
