'use client'

import { useState } from 'react'

type BriefSource = 'manual' | 'bot'

interface QuickActionsProps {
  onCreateBrief: (source: BriefSource, topic: string) => Promise<void>
  onCreateCourse: (title: string) => Promise<void>
}

const cls = {
  input:
    'w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-indigo-500/50',
  select:
    'w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:ring-2 focus:ring-indigo-500/50',
  btnPrimary:
    'rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  sectionCard:
    'rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_40px_-12px_rgba(0,0,0,0.7)]',
  h2: 'text-lg font-medium text-neutral-100',
}

function Card({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <section className={cls.sectionCard}>
      {title && (
        <div className="mb-3">
          <h2 className={cls.h2}>{title}</h2>
        </div>
      )}
      {children}
    </section>
  )
}

export default function QuickActions({
  onCreateBrief,
  onCreateCourse,
}: QuickActionsProps) {
  const [newBriefTopic, setNewBriefTopic] = useState('')
  const [newBriefSource, setNewBriefSource] = useState<BriefSource>('manual')
  const [newCourseTitle, setNewCourseTitle] = useState('')

  const handleCreateBrief = async () => {
    await onCreateBrief(newBriefSource, newBriefTopic)
    setNewBriefTopic('')
  }

  const handleCreateCourse = async () => {
    await onCreateCourse(newCourseTitle)
    setNewCourseTitle('')
  }

  return (
    <div className="grid gap-6">
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
            onClick={handleCreateBrief}
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
            onClick={handleCreateCourse}
            className={cls.btnPrimary}
            disabled={!newCourseTitle.trim()}
          >
            Create Course
          </button>
        </div>
      </Card>
    </div>
  )
}
