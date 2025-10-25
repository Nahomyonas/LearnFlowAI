import React from 'react'

export type BriefSource = 'manual' | 'bot'
export type BriefModeState =
  | 'collecting'
  | 'ready_for_outline'
  | 'outline_ready'
  | 'outcomes_ready'
  | 'committed'
  | 'abandoned'

export type BriefCardData = {
  id: string
  topic: string | null
  source: BriefSource
  mode_state: BriefModeState
  updated_at: string
}

type Props = {
  brief: BriefCardData
  committing?: boolean
  onCommit: () => void
  onGenerateOutline?: () => void
}

export default function BriefCard({ brief, committing = false, onCommit, onGenerateOutline }: Props) {
  const humanTime = new Date(brief.updated_at).toLocaleString()
  const disabled = brief.mode_state === 'committed' || committing
  const canGenerateOutline = 
    brief.mode_state === 'collecting' || 
    brief.mode_state === 'ready_for_outline'
  const hasOutline = 
    brief.mode_state === 'outline_ready' || 
    brief.mode_state === 'outcomes_ready'

  return (
    <li className="rounded-lg border border-neutral-800 p-3 bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-neutral-100">
            {brief.topic || '(untitled brief)'}
          </div>
          <div className="text-xs text-neutral-400">
            {brief.source} · {brief.mode_state} · updated {humanTime}
          </div>
        </div>
        <div className="flex gap-2">
          {canGenerateOutline && onGenerateOutline && (
            <button
              onClick={onGenerateOutline}
              className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm text-white hover:bg-indigo-400 transition-colors"
            >
              Generate with AI
            </button>
          )}
          {hasOutline && (
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 text-xs text-indigo-300">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI Outline Ready
            </span>
          )}
          <button
            onClick={onCommit}
            disabled={disabled}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {committing ? 'Committing…' : 'Commit → Course'}
          </button>
        </div>
      </div>
    </li>
  )
}
