import Modal from './Modal'
import { GAMES } from './config'

export default function GamePicker({ current, onPick, onClose }) {
  return (
    <Modal title="Choose a game" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => onPick(g)}
            className={`rounded-2xl p-4 text-left ring-1 ${g.id === current.id ? 'bg-amber-400/10 ring-amber-400/50' : 'bg-white/5 ring-white/10'}`}
          >
            <span className="text-3xl">{g.icon}</span>
            <span className="mt-2 block font-semibold">{g.name}</span>
            <span className="text-xs text-slate-400">Unofficial helper</span>
          </button>
        ))}
        <div className="grid place-items-center rounded-2xl border-2 border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
          More games
          <br />
          coming soon
        </div>
      </div>
    </Modal>
  )
}
