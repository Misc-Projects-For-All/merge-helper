import { useEffect, useState } from 'react'

const fresh = (levels) => ({ target: levels, owned: Array(levels).fill(0), locked: Array(levels).fill(0) })
const resize = (a, n) => [...a.slice(0, n), ...Array(Math.max(0, n - a.length)).fill(0)]

// A shared link (#/game?s=...) wins over this device's saved board.
function initial(game) {
  try {
    const shared = new URLSearchParams(location.hash.split('?')[1]).get('s')
    return (shared ? JSON.parse(atob(shared)) : JSON.parse(localStorage.getItem(`mh:${game.id}`))) ?? fresh(game.levels)
  } catch {
    return fresh(game.levels)
  }
}

// Item n is worth 2^(n-1) energy. Locked items count too: merging a matching
// item into one yields the next level, so the total value is unchanged.
export function energyNeeded({ target, owned, locked }) {
  if (owned.slice(target - 1).some(Boolean)) return 0
  const have = owned.slice(0, target - 1).reduce((s, n, i) => s + (n + locked[i]) * 2 ** i, 0)
  return Math.max(0, 2 ** (target - 1) - have)
}

export function useBoard(game) {
  const [b, set] = useState(() => initial(game))
  const levels = b.owned.length

  useEffect(() => {
    try {
      localStorage.setItem(`mh:${game.id}`, JSON.stringify(b))
    } catch {} // storage unavailable (private mode): the app still works, just doesn't persist
  }, [game.id, b])

  return {
    ...b,
    levels,
    setCount: (kind, i, v) => set((p) => ({ ...p, [kind]: p[kind].map((n, j) => (j === i ? Math.max(0, v) : n)) })),
    setTarget: (target) => set((p) => ({ ...p, target })),
    setLevels: (n) =>
      n >= 2 && n <= 30 &&
      set((p) => ({ target: p.target === levels ? n : Math.min(p.target, n), owned: resize(p.owned, n), locked: resize(p.locked, n) })),
    reset: () => set(fresh(levels)),
    shareUrl: () => `${location.origin}${location.pathname}#/${game.id}?s=${btoa(JSON.stringify(b))}`,
  }
}
