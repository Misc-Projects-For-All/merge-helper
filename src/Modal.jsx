export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/60 backdrop-blur-sm sm:place-items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-900 p-5 ring-1 ring-white/10 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="size-8 rounded-full bg-white/5 text-slate-400">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
