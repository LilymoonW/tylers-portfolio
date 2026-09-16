'use client'

import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

type MotionState = 'running' | 'paused'

/**
 * Site-wide motion switch for the looping marquees and the intro video.
 * State lives on `<html data-motion>` so CSS can pause animations directly
 * (see globals.css). Defaults to paused for `prefers-reduced-motion` users,
 * who can opt back in here.
 */
const MOTION_EVENT = 'motionchange'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onChange)
  window.addEventListener(MOTION_EVENT, onChange)
  return () => {
    mq.removeEventListener('change', onChange)
    window.removeEventListener(MOTION_EVENT, onChange)
  }
}

export function getMotionState(): MotionState {
  const set = document.documentElement.dataset.motion
  if (set === 'running' || set === 'paused') return set
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'paused'
    : 'running'
}

function getServerSnapshot(): MotionState {
  return 'running'
}

function setMotionState(next: MotionState) {
  document.documentElement.dataset.motion = next
  window.dispatchEvent(new Event(MOTION_EVENT))
}

/** Subscribe to motion-state changes from anywhere (e.g. the intro video). */
export function onMotionStateChange(listener: (state: MotionState) => void) {
  return subscribe(() => listener(getMotionState()))
}

export default function MotionToggle({ className }: { className?: string }) {
  const state = useSyncExternalStore(subscribe, getMotionState, getServerSnapshot)
  const paused = state === 'paused'

  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setMotionState(paused ? 'running' : 'paused')}
      className={cn('cursor-pointer bg-transparent p-0', className)}
    >
      {paused ? 'PLAY MOTION' : 'PAUSE MOTION'}
    </button>
  )
}
