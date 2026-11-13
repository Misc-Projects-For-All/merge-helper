import { useEffect, useState } from 'react'
import { GAMES, SUPPORT_URL, FEEDBACK_URL } from './config'
import Calculator from './Calculator'
import GamePicker from './GamePicker'

const fromHash = () => GAMES.find((g) => location.hash.startsWith(`#/${g.id}`)) ?? GAMES[0]

export default function App() {
  const [game, setGame] = useState(fromHash)
  const [picking, setPicking] = useState(false)
  useEffect(() => history.replaceState(null, '', `#/${game.id}`), [game]) // also drops a consumed ?s= share param

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1e293b,#020617_65%)]">
      <div className="mx-auto max-w-md px-4 pb-10">
        <header className="flex items-center justify-between py-5">
          <button onClick={() => setPicking(true)} className="flex items-center gap-3 text-left">
            <span className="grid size-11 place-items-center rounded-2xl bg-amber-400/15 text-2xl ring-1 ring-amber-400/30">{game.icon}</span>
            <span>
              <span className="block font-bold">{game.name} <span className="text-slate-500">▾</span></span>
              <span className="text-xs text-slate-400">{game.subtitle}</span>
            </span>
          </button>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="rounded-full bg-amber-400 px-3.5 py-1.5 text-sm font-semibold text-slate-950">☕ Support</a>
        </header>

        <Calculator key={game.id} game={game} />

        <footer className="mt-10 space-y-2 text-center text-xs text-slate-500">
          <p>
            Free forever. If it saved you energy, <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="text-amber-400">buy me a coffee</a>.
          </p>
          <p><a href={FEEDBACK_URL} target="_blank" rel="noreferrer" className="text-slate-300 underline">Feedback & game requests</a></p>
          <p>Unofficial fan tool. Not affiliated with or endorsed by Moon Active.</p>
        </footer>
      </div>
      {picking && <GamePicker current={game} onPick={(g) => (setGame(g), setPicking(false))} onClose={() => setPicking(false)} />}
    </div>
  )
}
