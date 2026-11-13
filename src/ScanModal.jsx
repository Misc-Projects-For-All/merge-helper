import { useRef, useState } from 'react'
import Modal from './Modal'
import { scan } from './scan'

const BOXES = {
  bar: { label: '1. Chain bar', color: 'border-amber-400', hint: 'Drag a tight box over the item chain bar, from the left edge of item 1 to the right edge of the last item.' },
  board: { label: '2. Board', color: 'border-teal-400', hint: 'Drag a box over the whole board grid, edge to edge.' },
}
const clamp = (v) => Math.min(1, Math.max(0, v))
const pct = (v) => `${v * 100}%`
const saved = () => {
  try {
    return JSON.parse(localStorage.getItem('mh:rects')) ?? {}
  } catch {
    return {}
  }
}

export default function ScanModal({ levels, onApply, onClose }) {
  const [src, setSrc] = useState(null)
  const [rects, setRects] = useState(saved) // boxes are remembered: same phone = same layout
  const [step, setStep] = useState('bar')
  const [grid, setGrid] = useState(rects.grid ?? [7, 7])
  const img = useRef(null)
  const start = useRef(null)

  const pos = (e) => {
    const r = img.current.getBoundingClientRect()
    return [clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height)]
  }
  const move = (e) => {
    if (!start.current) return
    const [[x0, y0], [x1, y1]] = [start.current, pos(e)]
    setRects((r) => ({ ...r, [step]: [Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)] }))
  }

  const run = () => {
    const el = img.current, cv = document.createElement('canvas')
    ;[cv.width, cv.height] = [el.naturalWidth, el.naturalHeight]
    const ctx = cv.getContext('2d')
    ctx.drawImage(el, 0, 0)
    try {
      localStorage.setItem('mh:rects', JSON.stringify({ ...rects, grid }))
    } catch {}
    onApply(scan(ctx.getImageData(0, 0, cv.width, cv.height), rects.bar, rects.board, levels, ...grid))
  }

  return (
    <Modal title="Scan a screenshot" onClose={onClose}>
      {!src ? (
        <label className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-white/15 p-10 text-center text-slate-400">
          <span className="text-4xl">📷</span>
          <span className="mt-2 text-sm">Choose a screenshot of your board</span>
          <span className="mt-1 text-xs text-slate-500">Stays on your device, nothing is uploaded</span>
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && setSrc(URL.createObjectURL(e.target.files[0]))} />
        </label>
      ) : (
        <>
          <div className="mb-2 flex gap-2 text-xs">
            {Object.entries(BOXES).map(([k, b]) => (
              <button key={k} onClick={() => setStep(k)} className={`rounded-full px-3 py-1 ${step === k ? 'bg-amber-400 text-slate-950' : 'bg-white/10'}`}>
                {b.label} {rects[k] && '✓'}
              </button>
            ))}
          </div>
          <p className="mb-3 text-sm text-slate-300">{BOXES[step].hint}</p>
          <div className="flex justify-center">
            <div
              className="relative touch-none select-none"
              onPointerDown={(e) => (e.currentTarget.setPointerCapture(e.pointerId), (start.current = pos(e)))}
              onPointerMove={move}
              onPointerUp={() => ((start.current = null), step === 'bar' && setStep('board'))}
            >
              <img ref={img} src={src} alt="" draggable={false} className="block max-h-[55dvh] rounded-xl" />
              {Object.entries(BOXES).map(([k, b]) =>
                rects[k] ? (
                  <div key={k} className={`pointer-events-none absolute border-2 ${b.color} bg-white/5`}
                    style={{ left: pct(rects[k][0]), top: pct(rects[k][1]), width: pct(rects[k][2]), height: pct(rects[k][3]) }} />
                ) : null,
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-400">Grid</span>
            {['Rows', 'Cols'].map((label, i) => (
              <label key={label} className="flex items-center gap-2">
                {label}
                <input type="number" min="3" max="12" value={grid[i]} className="w-14 rounded-lg bg-white/5 px-2 py-1 text-center"
                  onChange={(e) => setGrid((g) => g.map((v, j) => (j === i ? +e.target.value : v)))} />
              </label>
            ))}
          </div>
          <button disabled={!rects.bar || !rects.board} onClick={run}
            className="mt-4 w-full rounded-2xl bg-amber-400 py-3 font-bold text-slate-950 disabled:opacity-40">
            Scan board
          </button>
        </>
      )}
    </Modal>
  )
}
