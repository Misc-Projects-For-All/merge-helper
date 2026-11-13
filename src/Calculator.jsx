import { Fragment, useState } from 'react'
import { useBoard, energyNeeded } from './useBoard'

function Stepper({ value, onChange, tone }) {
  const btn = 'size-8 rounded-lg bg-white/5 text-lg leading-none active:scale-90 transition'
  return (
    <div className="flex items-center justify-center gap-1">
      <button className={btn} onClick={() => onChange(value - 1)}>−</button>
      <input inputMode="numeric" value={value} onChange={(e) => onChange(+e.target.value.replace(/\D/g, '') || 0)}
        className={`w-9 bg-transparent text-center font-semibold outline-none ${value ? tone : 'text-slate-600'}`} />
      <button className={btn} onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}

export default function Calculator({ game }) {
  const b = useBoard(game)
  const [note, setNote] = useState('')
  const need = energyNeeded(b), total = 2 ** (b.target - 1)
  const flash = (msg) => (setNote(msg), setTimeout(() => setNote(''), 6000))
  const action = 'flex-1 rounded-2xl bg-white/5 py-2.5 text-sm font-medium ring-1 ring-white/10 active:bg-white/10'

  return (
    <>
      <section className="sticky top-2 z-10 rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 p-5 text-slate-950 shadow-xl shadow-orange-500/20">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Energy needed for</span>
          <select value={b.target} onChange={(e) => b.setTarget(+e.target.value)} className="rounded-lg bg-black/10 px-2 py-1 font-semibold">
            {b.owned.map((_, i) => (
              <option key={i} value={i + 1}>Item {i + 1}{i + 1 === b.levels ? ' (max)' : ''}</option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-5xl font-black tabular-nums">⚡{need.toLocaleString()}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/15">
          <div className="h-full rounded-full bg-slate-950/70 transition-all" style={{ width: `${(1 - need / total) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs font-medium">{(total - need).toLocaleString()} of {total.toLocaleString()} already on your board</p>
      </section>

      <div className="mt-4 flex gap-2">
        <button className={action} onClick={() => navigator.clipboard.writeText(b.shareUrl()).then(() => flash('Link copied. Open it on any device to continue.'))}>🔗 Copy link</button>
        <button className={action} onClick={() => confirm('Clear the whole board?') && b.reset()}>↺ Reset</button>
      </div>
      {note && <p className="mt-3 rounded-2xl bg-teal-400/10 px-4 py-2.5 text-sm text-teal-200 ring-1 ring-teal-400/20">{note}</p>}

      <section className="mt-4 rounded-3xl bg-white/[0.03] p-3 ring-1 ring-white/10">
        <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-y-1.5 text-sm">
          <span />
          <span className="text-center text-xs text-slate-400">On board</span>
          <span className="text-center text-xs text-slate-400">Locked 🔒</span>
          {b.owned.map((n, i) => (
            <Fragment key={i}>
              <span className={`pl-2 pr-1 font-medium ${i + 1 > b.target ? 'text-slate-600' : ''}`}>Item {i + 1}</span>
              <Stepper value={n} onChange={(v) => b.setCount('owned', i, v)} tone="text-amber-300" />
              <Stepper value={b.locked[i]} onChange={(v) => b.setCount('locked', i, v)} tone="text-teal-300" />
            </Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 border-t border-white/5 pt-3 text-sm text-slate-400">
          <button onClick={() => b.setLevels(b.levels - 1)} className="px-2">− level</button>
          <span className="text-slate-200">{b.levels} levels</span>
          <button onClick={() => b.setLevels(b.levels + 1)} className="px-2">+ level</button>
        </div>
      </section>
      <p className="mt-2 px-2 text-xs text-slate-500">Locked = faded items on teal tiles. They count once you merge a matching item into them. Saved automatically on this device.</p>
    </>
  )
}
