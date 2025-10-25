type BriefSource = 'manual' | 'bot'
type Status = 'draft' | 'published' | 'archived'

type Brief = {
  id: string
  topic: string | null
  source: BriefSource
  mode_state:
    | 'collecting'
    | 'ready_for_outline'
    | 'outline_ready'
    | 'outcomes_ready'
    | 'committed'
    | 'abandoned'
  created_at: string
  updated_at: string
}

type Course = {
  id: string
  title: string
  slug: string
  status: Status
  visibility: 'private' | 'unlisted' | 'public'
  updated_at: string
  goals?: string[] | null // ← add this
}

type Module = {
  id: string
  title: string
  summary: string | null
  position: number
  status: Status
  updated_at: string
}

type Lesson = {
  id: string
  moduleId: string
  title: string
  status: Status
  position: number
  updated_at: string
}

/* ================
   API helpers
   ================ */
export const api = {
  briefs: {
    list: async (limit = 20) => {
      const res = await fetch(`/api/course-briefs?limit=${limit}`, {
        cache: 'no-store',
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error?.message || 'Failed to load briefs')
      return (j.items ?? []) as Brief[]
    },
    create: async (payload: { source: BriefSource; topic: string }) => {
      const res = await fetch('/api/course-briefs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to create brief')
    },
    commit: async (id: string) => {
      const res = await fetch(`/api/course-briefs/${id}/commit`, {
        method: 'POST',
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(
          j?.error?.message ||
            (res.status === 409 ? 'Already committed' : 'Commit failed')
        )
    },
  },
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
    create: async (payload: { title: string }) => {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to create course')
    },
  },
  modules: {
    listByCourse: async (courseId: string) => {
      const res = await fetch(`/api/course-modules?course_id=${courseId}`, {
        cache: 'no-store',
      })
      const j = await res.json()
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to load modules')
      return (j.items ?? []) as Module[]
    },
    create: async (payload: { courseId: string; title: string }) => {
      const res = await fetch('/api/course-modules', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to create module')
    },
  },
  lessons: {
    listByModule: async (moduleId: string) => {
      const res = await fetch(`/api/lessons?module_id=${moduleId}`, {
        cache: 'no-store',
      })
      const j = await res.json()
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to load lessons')
      return (j.items ?? []) as Lesson[]
    },
    create: async (payload: { moduleId: string; title: string }) => {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to create lesson')
      return j as Lesson
    },
  },
}
