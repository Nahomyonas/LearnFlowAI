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
    get: async (id: string) => {
      const res = await fetch(`/api/course-briefs/${id}`, {
        cache: 'no-store',
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Brief not found')
        }
        throw new Error(j?.error?.message || 'Failed to load brief')
      }
      return j as {
        id: string
        topic: string | null
        details: string | null
        source: BriefSource
        learner_level: string | null
        target_difficulty: string | null
        goals: string[] | null
        planOutline: any
        mode_state: string
        version: number
        created_at: string
        updated_at: string
      }
    },
    create: async (payload: { 
      source?: BriefSource; 
      topic?: string; 
      details?: string; 
      goals?: string[];
      learner_level?: string;
      target_difficulty?: string;
    }) => {
      const res = await fetch('/api/course-briefs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to create brief')
      return j as { id: string; mode_state: string }
    },
    patch: async (
      id: string,
      version: number,
      payload: {
        topic?: string;
        details?: string;
        goals?: string[];
        learner_level?: string;
        target_difficulty?: string;
      }
    ) => {
      const res = await fetch(`/api/course-briefs/${id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'if-match': `W/"${version}"`,
        },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Version conflict - brief was modified')
        }
        throw new Error(j?.error?.message || 'Failed to update brief')
      }
      return j as {
        id: string
        topic: string | null
        details: string | null
        source: BriefSource
        learner_level: string | null
        target_difficulty: string | null
        goals: string[] | null
        mode_state: string
        version: number
        created_at: string
        updated_at: string
      }
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
    create: async (payload: { moduleId: string; title: string; content?: any }) => {
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
    update: async (id: string, payload: { title?: string; content?: any; status?: string; position?: number }, etag?: string) => {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          ...(etag ? { 'if-match': etag } : {}),
        },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error?.message || 'Failed to update lesson');
      return j as Lesson;
    },
  },
  ai: {
      generateLessonContent: async (payload: {
        topic: string;
        moduleTitle: string;
        lessonTitle: string;
        details?: string;
        learnerLevel?: 'novice' | 'intermediate' | 'advanced';
        targetDifficulty?: 'easy' | 'standard' | 'rigorous' | 'expert';
      }) => {
        const res = await fetch('/api/ai/generate-lesson-content', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const j = await res.json().catch(() => ({}))
        if (!res.ok)
          throw new Error(j?.error?.message || 'Failed to generate lesson content')
        return j as { content: string }
      },
    generateOutline: async (payload: {
      briefId: string;
      topic?: string;
      details?: string;
      learnerLevel?: string;
      targetDifficulty?: string;
      goals?: string[];
    }) => {
      const res = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to generate outline')
      return j as { 
        moduleCount: number;
        lessonCount: number;
        aiEventId: string;
      }
    },
    analyzePrerequisites: async (payload: {
      topic: string;
      details?: string;
    }) => {
      const res = await fetch('/api/ai/analyze-prerequisites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to analyze prerequisites')
      return j as { prerequisites: string[] }
    },
    recommendLearningGoals: async (payload: {
      topic: string;
      details?: string;
    }) => {
      const res = await fetch('/api/ai/recommend-goals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to recommend goals')
      return j as { goals: string[] }
    },
    assessLearnerLevel: async (payload: {
      topic: string;
      details?: string;
      prerequisites: Array<{ text: string; checked: boolean }>;
    }) => {
      const res = await fetch('/api/ai/assess-level', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(j?.error?.message || 'Failed to assess learner level')
      return j as {
        level: 'novice' | 'intermediate' | 'advanced';
        explanation: string;
      }
    },
  },
}
