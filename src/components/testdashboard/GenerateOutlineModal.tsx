'use client'

import { useState } from 'react'
import type { AiOutline } from '@/contracts/ai-outline'

interface GenerateOutlineModalProps {
  briefId: string
  topic: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: { moduleCount: number; lessonCount: number }) => void
}

const cls = {
  overlay:
    'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
  modal:
    'relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col',
  header: 'px-6 py-4 border-b border-neutral-800',
  title: 'text-xl font-semibold text-neutral-100',
  subtitle: 'text-sm text-neutral-400 mt-1',
  body: 'flex-1 overflow-y-auto px-6 py-4',
  footer: 'px-6 py-4 border-t border-neutral-800 flex justify-end gap-3',
  btnPrimary:
    'rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  btnSecondary:
    'rounded-md border border-neutral-700 px-4 py-2 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  pre: 'rounded-md bg-neutral-950 border border-neutral-800 p-4 text-xs text-neutral-300 overflow-x-auto max-h-96',
  moduleCard: 'rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 mb-3',
  lessonItem: 'text-sm text-neutral-300 ml-4 mb-1',
}

type ModalState = 'idle' | 'loading' | 'preview' | 'confirming' | 'success' | 'error'

export default function GenerateOutlineModal({
  briefId,
  topic,
  isOpen,
  onClose,
  onSuccess,
}: GenerateOutlineModalProps) {
  const [state, setState] = useState<ModalState>('idle')
  const [outline, setOutline] = useState<AiOutline | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showJson, setShowJson] = useState(false)

  async function handleGenerate() {
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to generate outline')
      }

      // Fetch the updated brief to get the outline
      const briefRes = await fetch(`/api/course-briefs/${briefId}`)
      const briefData = await briefRes.json()

      if (!briefRes.ok || !briefData.planOutline) {
        throw new Error('Failed to load generated outline')
      }

      setOutline(briefData.planOutline)
      setState('preview')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setState('error')
    }
  }

  async function handleConfirm() {
    if (!outline) return

    setState('confirming')
    
    // Calculate counts
    const moduleCount = outline.modules.length
    const lessonCount = outline.modules.reduce(
      (sum, mod) => sum + mod.lessons.length,
      0
    )

    // Simulate a brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    setState('success')
    onSuccess({ moduleCount, lessonCount })
    
    // Auto-close after showing success
    setTimeout(() => {
      handleClose()
    }, 1500)
  }

  function handleClose() {
    setState('idle')
    setOutline(null)
    setError(null)
    setShowJson(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={cls.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={cls.modal}>
        {/* Header */}
        <div className={cls.header}>
          <h2 className={cls.title}>Generate AI Outline</h2>
          <p className={cls.subtitle}>
            Topic: <span className="text-neutral-200">{topic}</span>
          </p>
        </div>

        {/* Body */}
        <div className={cls.body}>
          {state === 'idle' && (
            <div className="text-center py-8">
              <p className="text-neutral-300 mb-4">
                Ready to generate an AI-powered course outline?
              </p>
              <p className="text-sm text-neutral-400">
                This will create a structured outline with modules and lessons based on your
                brief.
              </p>
            </div>
          )}

          {state === 'loading' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-700 border-t-indigo-500 mb-4" />
              <p className="text-neutral-300">Generating outline with AI...</p>
              <p className="text-sm text-neutral-400 mt-2">This may take a few seconds</p>
            </div>
          )}

          {state === 'preview' && outline && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-neutral-100">
                    {outline.courseTitle}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {outline.modules.length} modules •{' '}
                    {outline.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
                  </p>
                </div>
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {showJson ? 'Show Preview' : 'Show JSON'}
                </button>
              </div>

              {showJson ? (
                <pre className={cls.pre}>{JSON.stringify(outline, null, 2)}</pre>
              ) : (
                <>
                  <div className="mb-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <p className="text-sm text-neutral-300">{outline.courseSummary}</p>
                  </div>

                  <div className="space-y-3">
                    {outline.modules.map((module, idx) => (
                      <div key={idx} className={cls.moduleCard}>
                        <h4 className="font-medium text-neutral-100 mb-1">
                          {idx + 1}. {module.title}
                        </h4>
                        {module.summary && (
                          <p className="text-sm text-neutral-400 mb-2">{module.summary}</p>
                        )}
                        <div className="mt-2">
                          {module.lessons.map((lesson, lessonIdx) => (
                            <div key={lessonIdx} className={cls.lessonItem}>
                              • {lesson.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {state === 'confirming' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-700 border-t-indigo-500 mb-4" />
              <p className="text-neutral-300">Confirming outline...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-neutral-300 font-medium">Outline generated successfully!</p>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
                <svg
                  className="w-8 h-8 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-neutral-300 font-medium mb-2">Generation failed</p>
              <p className="text-sm text-neutral-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cls.footer}>
          {state === 'idle' && (
            <>
              <button onClick={handleClose} className={cls.btnSecondary}>
                Cancel
              </button>
              <button onClick={handleGenerate} className={cls.btnPrimary}>
                Generate Outline
              </button>
            </>
          )}

          {state === 'preview' && (
            <>
              <button onClick={handleClose} className={cls.btnSecondary}>
                Cancel
              </button>
              <button onClick={handleConfirm} className={cls.btnPrimary}>
                Confirm & Use This Outline
              </button>
            </>
          )}

          {state === 'error' && (
            <>
              <button onClick={handleClose} className={cls.btnSecondary}>
                Close
              </button>
              <button onClick={handleGenerate} className={cls.btnPrimary}>
                Try Again
              </button>
            </>
          )}

          {(state === 'loading' || state === 'confirming' || state === 'success') && (
            <button disabled className={cls.btnSecondary}>
              Please wait...
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
