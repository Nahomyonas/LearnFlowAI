'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import UserMenu from './UserMenu'

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
   Style tokens
   ================ */
const cls = {
  page: 'mx-auto max-w-6xl p-6 space-y-8 text-neutral-100',
  headerBtn:
    'rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors',
  chip: 'rounded-full border border-neutral-700/70 px-3 py-1 text-sm text-neutral-300',
  sectionCard:
    'rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_40px_-12px_rgba(0,0,0,0.7)]',
  h1: 'text-2xl font-semibold',
  h2: 'text-lg font-medium text-neutral-100',
  sub: 'mt-1 text-sm text-neutral-400',
  input:
    'w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-indigo-500/50',
  select:
    'w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:ring-2 focus:ring-indigo-500/50',
  btnPrimary:
    'rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  btnGhost:
    'rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  listItem: 'rounded-lg border border-neutral-800 p-3 bg-neutral-900/60',
  divider: 'h-px bg-neutral-800',
}

/* ================
   API helpers
   ================ */
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

/* ================
   Small UI bits
   ================ */
function Banner({
  kind = 'info',
  children,
}: {
  kind?: 'info' | 'error'
  children: React.ReactNode
}) {
  const base = 'rounded-md px-3 py-2 text-sm'
  const map = {
    info: 'border border-indigo-500/20 bg-indigo-500/10 text-indigo-200',
    error: 'border border-rose-500/20 bg-rose-500/10 text-rose-200',
  }
  return <div className={`${base} ${map[kind]}`}>{children}</div>
}

function Card({
  title,
  subtitle,
  right,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`${cls.sectionCard} ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            {title && <h2 className={cls.h2}>{title}</h2>}
            {subtitle && <p className={cls.sub}>{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

export default function DashboardClient() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [messageKind, setMessageKind] = useState<'info' | 'error'>('info')
  const [loading, setLoading] = useState(false)

  const [newBriefTopic, setNewBriefTopic] = useState('')
  const [newBriefSource, setNewBriefSource] = useState<BriefSource>('manual')
  const [newCourseTitle, setNewCourseTitle] = useState('')

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)
  const [modulesByCourse, setModulesByCourse] = useState<
    Record<string, Module[]>
  >({})
  const [newModuleTitleByCourse, setNewModuleTitleByCourse] = useState<
    Record<string, string>
  >({})
  const [loadingModulesFor, setLoadingModulesFor] = useState<string | null>(
    null
  )
  const [committingId, setCommittingId] = useState<string | null>(null)

  const [lessonsByModule, setLessonsByModule] = useState<
    Record<string, Lesson[]>
  >({})
  const [newLessonTitleByModule, setNewLessonTitleByModule] = useState<
    Record<string, string>
  >({})
  const [loadingLessonsFor, setLoadingLessonsFor] = useState<string | null>(
    null
  )

  const [editingGoalsFor, setEditingGoalsFor] = useState<string | null>(null)
  const [goalsDraftByCourse, setGoalsDraftByCourse] = useState<
    Record<string, string>
  >({})

  const { data: session } = useSession()
  const router = useRouter()
  const loadAbort = useRef<AbortController | null>(null)

  function setInfo(m: string) {
    setMessageKind('info')
    setMessage(m)
  }
  function setError(m: string) {
    setMessageKind('error')
    setMessage(m)
  }

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
      if (!ac.signal.aborted) setError(e?.message ?? 'Load failed')
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
      setError(e?.message ?? 'Error loading modules')
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
      setInfo('Brief created ✅')
    } catch (e: any) {
      setError(e?.message ?? 'Error creating brief')
    }
  }

  async function createCourse() {
    setMessage(null)
    try {
      await api.courses.create({ title: newCourseTitle })
      setNewCourseTitle('')
      await loadAll()
      setInfo('Course created ✅')
    } catch (e: any) {
      setError(e?.message ?? 'Error creating course')
    }
  }

  async function commitBrief(id: string) {
    setMessage(null)
    setCommittingId(id)
    try {
      await api.briefs.commit(id)
      await loadAll()
      setInfo('Committed brief → course ✅')
    } catch (e: any) {
      setError(e?.message ?? 'Commit error')
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
      setInfo('Module created ✅')
    } catch (e: any) {
      setError(e?.message ?? 'Error creating module')
    }
  }

  async function loadLessons(moduleId: string) {
    setLoadingLessonsFor(moduleId)
    setMessage(null)
    try {
      const items = await api.lessons.listByModule(moduleId)
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: items }))
    } catch (e: any) {
      setError(e?.message ?? 'Error loading lessons')
    } finally {
      setLoadingLessonsFor(null)
    }
  }

  async function createLesson(moduleId: string) {
    setMessage(null)
    const title = (newLessonTitleByModule[moduleId] || '').trim()
    if (!title) return
    try {
      await api.lessons.create({ moduleId, title })
      setNewLessonTitleByModule((prev) => ({ ...prev, [moduleId]: '' }))
      await loadLessons(moduleId)
      setInfo('Lesson created ✅')
    } catch (e: any) {
      setError(e?.message ?? 'Error creating lesson')
    }
  }

  function startEditGoals(c: Course) {
    setEditingGoalsFor(c.id)
    const text = (c.goals ?? []).join('\n')
    setGoalsDraftByCourse((prev) => ({ ...prev, [c.id]: text }))
  }

  async function saveGoals(courseId: string) {
    setMessage(null)
    try {
      const text = goalsDraftByCourse[courseId] || ''
      const goals = text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goals }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error?.message || 'Failed to save goals')
      setEditingGoalsFor(null)
      await loadAll() // refresh courses
      setInfo('Goals saved ✅')
    } catch (e: any) {
      setError(e?.message ?? 'Error saving goals')
    }
  }

  async function onLogout() {
    try {
      await signOut()
      router.replace('/signin')
    } catch (e: any) {
      setError(e?.message ?? 'Logout failed')
    }
  }

  useEffect(() => {
    loadAll()
    return () => loadAbort.current?.abort()
  }, [])

  const coursesCount = useMemo(() => courses.length, [courses])
  const briefsCount = useMemo(() => briefs.length, [briefs])
  const userLabel =
    session?.user?.name ||
    session?.user?.email ||
    (session ? 'Signed in' : 'Guest')

  return (
    <div className={cls.page}>
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">LearnFlow — Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Create briefs, turn them into courses, and add modules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
            aria-label="Refresh"
          >
            Refresh
          </button>
          <UserMenu />
        </div>
      </header>

      {message && <Banner kind={messageKind}>{message}</Banner>}

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="New Brief">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              className={cls.select}
              value={newBriefSource}
              onChange={(e) => setNewBriefSource(e.target.value as BriefSource)}
              aria-label="Brief source"
            >
              <option value="manual">manual</option>
              <option value="bot">bot</option>
            </select>
            <input
              className={cls.input}
              placeholder="Topic (e.g., Intro to React)"
              value={newBriefTopic}
              onChange={(e) => setNewBriefTopic(e.target.value)}
              aria-label="Brief topic"
            />
            <button
              onClick={createBrief}
              className={cls.btnPrimary}
              disabled={!newBriefTopic.trim()}
            >
              Create Brief
            </button>
          </div>
        </Card>

        <Card title="New Course (Manual)">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              className={cls.input}
              placeholder="Title (e.g., React for Beginners)"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              aria-label="Course title"
            />
            <button
              onClick={createCourse}
              className={cls.btnPrimary}
              disabled={!newCourseTitle.trim()}
            >
              Create Course
            </button>
          </div>
        </Card>
      </div>

      {/* Briefs */}
      <Card
        title="Your Briefs"
        right={
          <span className="text-sm text-neutral-400">{briefsCount} items</span>
        }
      >
        {loading ? (
          <div className="text-sm text-neutral-400">Loading…</div>
        ) : briefs.length === 0 ? (
          <div className="text-sm text-neutral-400">No briefs yet.</div>
        ) : (
          <ul className="grid gap-3">
            {briefs.map((b) => {
              const humanTime = new Date(b.updated_at).toLocaleString()
              const disabled = b.mode_state === 'committed'
              return (
                <li key={b.id} className={cls.listItem}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-100">
                        {b.topic || '(untitled brief)'}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {b.source} · {b.mode_state} · updated {humanTime}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => commitBrief(b.id)}
                        disabled={disabled || committingId === b.id}
                        className={cls.btnGhost}
                      >
                        {committingId === b.id
                          ? 'Committing…'
                          : 'Commit → Course'}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Courses */}
      <Card title="Your Courses">
        {loading ? (
          <div className="text-sm text-neutral-400">Loading…</div>
        ) : courses.length === 0 ? (
          <div className="text-sm text-neutral-400">No courses yet.</div>
        ) : (
          <ul className="grid gap-3">
            {courses.map((c) => {
              const humanTime = new Date(c.updated_at).toLocaleString()
              const isExpanded = expandedCourseId === c.id
              const modules = modulesByCourse[c.id] || []
              return (
                <li
                  key={c.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60"
                >
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium text-neutral-100">
                        {c.title}
                      </div>
                      <div className="text-xs text-neutral-400">
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
                          // after modules are loaded, fetch lessons for each module once
                          const mods = modulesByCourse[c.id] || []
                          for (const m of mods) {
                            if (!lessonsByModule[m.id]) {
                              // fire-and-forget; if you prefer serial, await inside loop
                              loadLessons(m.id)
                            }
                          }
                        }}
                        className={cls.btnGhost}
                      >
                        {isExpanded ? 'Hide modules' : 'Show modules'}
                      </button>

                      <div className="text-xs text-neutral-500">/{c.slug}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      <div className={cls.divider} />
                      <div className="p-3 space-y-4">
                        {/* GOALS EDITOR */}
                        <div className="rounded border border-neutral-800 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="text-sm font-medium text-neutral-200">
                              Goals
                            </div>
                            {editingGoalsFor === c.id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveGoals(c.id)}
                                  className={cls.btnPrimary}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingGoalsFor(null)}
                                  className={cls.btnGhost}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditGoals(c)}
                                className={cls.btnGhost}
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          {editingGoalsFor === c.id ? (
                            <textarea
                              className="h-28 w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                              placeholder="One goal per line (e.g., Understand JSX basics)"
                              value={goalsDraftByCourse[c.id] || ''}
                              onChange={(e) =>
                                setGoalsDraftByCourse((prev) => ({
                                  ...prev,
                                  [c.id]: e.target.value,
                                }))
                              }
                            />
                          ) : Array.isArray(c.goals) && c.goals.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm text-neutral-200">
                              {c.goals.map((g, i) => (
                                <li key={i}>{g}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-sm text-neutral-400">
                              No goals yet.
                            </div>
                          )}
                        </div>

                        {/* Modules */}
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-medium text-neutral-200">
                            Modules
                          </div>
                          {loadingModulesFor === c.id && (
                            <div className="text-xs text-neutral-400">
                              Loading…
                            </div>
                          )}
                        </div>

                        {/* New module */}
                        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center">
                          <input
                            className={cls.input}
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
                            disabled={
                              !(newModuleTitleByCourse[c.id] || '').trim()
                            }
                            className={cls.btnPrimary}
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
                                className="flex items-center justify-between rounded border border-neutral-800 p-2"
                              >
                                <div>
                                  <div className="font-medium text-neutral-100">
                                    {m.position}. {m.title}
                                  </div>
                                  <div className="text-xs text-neutral-400">
                                    {m.status} · updated{' '}
                                    {new Date(m.updated_at).toLocaleString()}
                                  </div>
                                </div>
                                {/* Lessons block */}
                                <div className="mt-2 rounded border border-neutral-800 p-2">
                                  <div className="mb-2 flex items-center justify-between">
                                    <div className="text-xs font-medium text-neutral-300">
                                      Lessons
                                    </div>
                                    {loadingLessonsFor === m.id && (
                                      <div className="text-xs text-neutral-400">
                                        Loading…
                                      </div>
                                    )}
                                  </div>

                                  {/* New lesson */}
                                  <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center">
                                    <input
                                      className={cls.input}
                                      placeholder="Lesson title (e.g., Introduction)"
                                      value={newLessonTitleByModule[m.id] || ''}
                                      onChange={(e) =>
                                        setNewLessonTitleByModule((prev) => ({
                                          ...prev,
                                          [m.id]: e.target.value,
                                        }))
                                      }
                                      aria-label="Lesson title"
                                    />
                                    <button
                                      onClick={() => createLesson(m.id)}
                                      disabled={
                                        !(
                                          newLessonTitleByModule[m.id] || ''
                                        ).trim()
                                      }
                                      className={cls.btnPrimary}
                                    >
                                      Add Lesson
                                    </button>
                                  </div>

                                  {/* List lessons */}
                                  {Array.isArray(lessonsByModule[m.id]) &&
                                  lessonsByModule[m.id]!.length > 0 ? (
                                    <ul className="grid gap-1">
                                      {lessonsByModule[m.id]!.map((l) => (
                                        <li
                                          key={l.id}
                                          className="flex items-center justify-between rounded border border-neutral-800 p-2"
                                        >
                                          <div className="text-sm text-neutral-200">
                                            {l.position}. {l.title}
                                          </div>
                                          <div className="text-xs text-neutral-500">
                                            {l.status} · updated{' '}
                                            {new Date(
                                              l.updated_at
                                            ).toLocaleString()}
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="text-sm text-neutral-400">
                                      No lessons yet.
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-neutral-400">
                            No modules yet.
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
