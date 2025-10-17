'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from '@/lib/auth-client'

function initialsFrom(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).slice(0, 2)
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || 'U'
  }
  const handle = email?.split('@')[0] ?? 'user'
  return handle.slice(0, 2).toUpperCase()
}

export default function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  const name = session?.user?.name ?? null
  const email = session?.user?.email ?? null
  const initials = initialsFrom(name, email)

  // close on outside click / escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (popRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full border border-neutral-700/70 bg-neutral-900 px-2.5 py-1 text-sm text-neutral-200 hover:bg-neutral-800"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden sm:inline text-neutral-300">{name || email || 'Account'}</span>
        <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/>
        </svg>
      </button>

      {open && (
        <div
          ref={popRef}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl"
        >
          <div className="px-3 py-3">
            <div className="text-sm font-medium text-neutral-100">
              {name || 'Signed in'}
            </div>
            {email && <div className="text-xs text-neutral-400">{email}</div>}
          </div>
          <div className="h-px bg-neutral-800" />
          <button
            onClick={async () => { await signOut(); }}
            className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
