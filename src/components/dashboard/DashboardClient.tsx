'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

/* =========================
   Types (keep close to usage)
   ========================= */
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
}

type Module = {
  id: string
  title: string
  summary: string | null
  position: number
  status: Status
  updated_at: string
}

/* =========================
   Small API helpers (typed)
   ========================= */
const api = {
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
      if (!res.ok) throw new Error(j?.error?.message || 'Failed to create brief')
    },
    commit: async (id: string) => {
      const res = await fetch(`/api/course-briefs/${id}/commit`, {
        method: 'POST',
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(
          j?.error?.message ||
            (res.status === 409 ? 'Already committed' : 'Commit failed'),
        )
    },
  },
  courses: {
    list: async (limit = 20) => {
      const res = await fetch(`/api/courses?limit=${limit}`, {
        cache: 'no-store',
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error?.message || 'Failed to load courses')
      return (j.items ?? []) as Course[]
    },
    create: async (payload: { title: string }) => {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error?.message || 'Failed to create course')
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
      if (!res.ok) throw new Error(j?.error?.message || 'Failed to create module')
    },
  },
}

/* =========================
   UI helpers
   ========================= */
function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
      {children}
    </div>
  )
}

export default function DashboardClient() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  // global UX status
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // forms
  const [newBriefTopic, setNewBriefTopic] = useState('')
  const [newBriefSource, setNewBriefSource] = useState<BriefSource>('manual')
  const [newCourseTitle, setNewCourseTitle] = useState('')

  // modules state (per course)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)
  const [modulesByCourse, setModulesByCourse] = useState<Record<string, Module[]>>(
    {},
  )
  const [newModuleTitleByCourse, setNewModuleTitleByCourse] = useState<
    Record<string, string>
  >({})
  const [loadingModulesFor, setLoadingModulesFor] = useState<string | null>(null)
  const [committingId, setCommittingId] = useState<string | null>(null)

  // avoid race on initial load
  const loadAbort = useRef<AbortController | null>(null)

  async function loadAll() {
    setMessage(null)
    setLoading(true)
    loadAbort.current?.abort()
    const ac = new AbortController()
    loadAbort.current = ac
    try {
      const [b, c] = await Promise.all([
        api.briefs.list(20),
        api.courses.list(20),
      ])
      if (ac.signal.aborted) return
      setBriefs(b)
      setCourses(c)
    } catch (e: any) {
      if (!ac.signal.aborted) setMessage(e?.message ?? 'Load failed')
    } finally {
      if (!ac.signal.aborted) setLoading(false)
    }
  }

  async function loadModules(courseId: string) {
    setLoadingModulesFor(courseId)
    setMessage(null)
    try {
      const items = await api.modules.listByCourse(courseId)
      setModulesByCourse((prev) => ({ ...prev, [courseId]: items }))
    } catch (e: any) {
      setMessage(e?.message ?? 'Error loading modules')
    } finally {
      setLoadingModulesFor(null)
    }
  }

  async function createBrief() {
    setMessage(null)
    try {
      await api.briefs.create({ source: newBriefSource, topic: newBriefTopic })
      setNewBriefTopic('')
      await loadAll()
      setMessage('Brief created ✅')
    } catch (e: any) {
      setMessage(e?.message ?? 'Error creating brief')
    }
  }

  async function createCourse() {
    setMessage(null)
    try {
      await api.courses.create({ title: newCourseTitle })
      setNewCourseTitle('')
      await loadAll()
      setMessage('Course created ✅')
    } catch (e: any) {
      setMessage(e?.message ?? 'Error creating course')
    }
  }

  async function commitBrief(id: string) {
    setMessage(null)
    setCommittingId(id)
    try {
      await api.briefs.commit(id)
      await loadAll()
      setMessage('Committed brief → course ✅')
    } catch (e: any) {
      setMessage(e?.message ?? 'Commit error')
    } finally {
      setCommittingId(null)
    }
  }

  async function createModule(courseId: string) {
    setMessage(null)
    const title = (newModuleTitleByCourse[courseId] || '').trim()
    if (!title) return
    try {
      await api.modules.create({ courseId, title })
      setNewModuleTitleByCourse((prev) => ({ ...prev, [courseId]: '' }))
      await loadModules(courseId)
      setMessage('Module created ✅')
    } catch (e: any) {
      setMessage(e?.message ?? 'Error creating module')
    }
  }

  useEffect(() => {
    loadAll()
    return () => loadAbort.current?.abort()
  }, [])

  const coursesCount = useMemo(() => courses.length, [courses])
  const briefsCount = useMemo(() => briefs.length, [briefs])

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">LearnFlow — Dashboard</h1>
        <button
          onClick={loadAll}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          aria-label="Refresh"
        >
          Refresh
        </button>
      </header>

      {message && <Banner>{message}</Banner>}

      {/* Create Brief */}
      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">New Brief</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            className="w-full rounded-md border px-3 py-2 md:w-40"
            value={newBriefSource}
            onChange={(e) =>
              setNewBriefSource(e.target.value as BriefSource)
            }
            aria-label="Brief source"
          >
            <option value="manual">manual</option>
            <option value="bot">bot</option>
          </select>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Topic (e.g., Intro to React)"
            value={newBriefTopic}
            onChange={(e) => setNewBriefTopic(e.target.value)}
            aria-label="Brief topic"
          />
          <button
            onClick={createBrief}
            className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-40"
            disabled={!newBriefTopic.trim()}
          >
            Create Brief
          </button>
        </div>
      </section>

      {/* Create Course (manual) */}
      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">New Course (Manual)</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Title (e.g., React for Beginners)"
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
            aria-label="Course title"
          />
          <button
            onClick={createCourse}
            className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-40"
            disabled={!newCourseTitle.trim()}
          >
            Create Course
          </button>
        </div>
      </section>

      {/* Briefs List */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Briefs</h2>
          <span className="text-sm text-gray-500">{briefsCount} items</span>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : briefs.length === 0 ? (
          <div className="text-sm text-gray-500">No briefs yet.</div>
        ) : (
          <ul className="grid gap-3">
            {briefs.map((b) => {
              const humanTime = new Date(b.updated_at).toLocaleString()
              const disabled = b.mode_state === 'committed'
              return (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">
                      {b.topic || '(untitled brief)'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {b.source} · {b.mode_state} · updated {humanTime}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => commitBrief(b.id)}
                      disabled={disabled || committingId === b.id}
                      className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40"
                    >
                      {committingId === b.id ? 'Committing…' : 'Commit → Course'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Courses List */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Courses</h2>
          <span className="text-sm text-gray-500">{coursesCount} items</span>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : courses.length === 0 ? (
          <div className="text-sm text-gray-500">No courses yet.</div>
        ) : (
          <ul className="grid gap-3">
            {courses.map((c) => {
              const humanTime = new Date(c.updated_at).toLocaleString()
              const isExpanded = expandedCourseId === c.id
              const modules = modulesByCourse[c.id] || []
              return (
                <li
                  key={c.id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-gray-500">
                        {c.status} · {c.visibility} · updated {humanTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const next = isExpanded ? null : c.id
                          setExpandedCourseId(next)
                          if (next && !modulesByCourse[c.id]) {
                            await loadModules(c.id)
                          }
                        }}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        {isExpanded ? 'Hide modules' : 'Show modules'}
                      </button>
                      <div className="text-xs text-gray-500">/{c.slug}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 w-full rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">Modules</div>
                        {loadingModulesFor === c.id && (
                          <div className="text-xs text-gray-500">Loading…</div>
                        )}
                      </div>

                      {/* New module form */}
                      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center">
                        <input
                          className="w-full rounded-md border px-3 py-2 md:w-2/3"
                          placeholder="Module title (e.g., Basics)"
                          value={newModuleTitleByCourse[c.id] || ''}
                          onChange={(e) =>
                            setNewModuleTitleByCourse((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          aria-label="Module title"
                        />
                        <button
                          onClick={() => createModule(c.id)}
                          disabled={!(newModuleTitleByCourse[c.id] || '').trim()}
                          className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-40"
                        >
                          Add Module
                        </button>
                      </div>

                      {/* Module list */}
                      {Array.isArray(modules) && modules.length > 0 ? (
                        <ul className="grid gap-2">
                          {modules.map((m) => (
                            <li
                              key={m.id}
                              className="flex items-center justify-between rounded border p-2"
                            >
                              <div>
                                <div className="font-medium">
                                  {m.position}. {m.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {m.status} · updated{' '}
                                  {new Date(m.updated_at).toLocaleString()}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No modules yet.
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
