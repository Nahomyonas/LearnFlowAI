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
}

export default function BriefCard({ brief, committing = false, onCommit }: Props) {
  const humanTime = new Date(brief.updated_at).toLocaleString()
  const disabled = brief.mode_state === 'committed' || committing

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
