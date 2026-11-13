// Screenshot scanner, fully in-browser. The game's own item-chain bar provides
// the reference icons, so no icon library is needed and new events just work.
const N = 16 // fingerprint resolution

// Fingerprint one region: trim its background, resample the icon to N×N.
function sig({ data, width }, x, y, w, h) {
  ;[x, y, w, h] = [x, y, w, h].map(Math.round)
  const px = (i, j) => {
    const k = ((y + j) * width + x + i) * 4
    return [data[k], data[k + 1], data[k + 2]]
  }
  const corners = [px(1, 1), px(w - 2, 1), px(1, h - 2), px(w - 2, h - 2)]
  const bg = [0, 1, 2].map((c) => corners.reduce((s, p) => s + p[c], 0) / 4)
  const isFg = (p) => Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) > 70

  const rows = Array(h).fill(0), cols = Array(w).fill(0)
  let count = 0
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++)
      if (isFg(px(i, j))) rows[j]++, cols[i]++, count++
  // Projection bounds ignore thin lines (e.g. the connector line in the chain bar).
  const span = (a, min) => [a.findIndex((v) => v > min), a.findLastIndex((v) => v > min)]
  const [x1, x2] = span(cols, h * 0.12), [y1, y2] = span(rows, w * 0.12)
  if (count < w * h * 0.05 || x1 < 0 || y1 < 0) return null

  const vec = []
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const p = px(x1 + Math.floor(((i + 0.5) * (x2 - x1 + 1)) / N), y1 + Math.floor(((j + 0.5) * (y2 - y1 + 1)) / N))
      vec.push(isFg(p) ? (p[0] + p[1] + p[2]) / 3 : null)
    }
  // Contrast-normalise luminance so faded/teal-tinted locked icons still match.
  const fg = vec.filter((v) => v !== null)
  const mean = fg.reduce((s, v) => s + v, 0) / fg.length
  const sd = Math.sqrt(fg.reduce((s, v) => s + (v - mean) ** 2, 0) / fg.length) || 1
  return { vec: vec.map((v) => (v === null ? null : (v - mean) / sd)), locked: bg[2] - bg[0] > 40 && bg[1] - bg[0] > 40 }
}

// Shape mismatch costs a fixed penalty; overlapping pixels compare luminance.
const dist = (a, b) =>
  a.reduce((s, v, i) => s + (v === null && b[i] === null ? 0 : v === null || b[i] === null ? 1.5 : Math.abs(v - b[i])), 0) / a.length

// img: ImageData; bar/board: [x, y, w, h] as fractions of the image.
// Locked tiles are only counted: their faded icons are too unreliable to identify.
export function scan(img, bar, board, levels, rows = 7, cols = 7, maxDist = 0.8) {
  const abs = ([x, y, w, h]) => [x * img.width, y * img.height, w * img.width, h * img.height]
  const [bx, by, bw, bh] = abs(bar), [gx, gy, gw, gh] = abs(board)
  const seg = bw / levels
  // Several slightly shifted crops per level, so a loosely drawn bar box still works.
  const refs = Array.from({ length: levels }, (_, i) =>
    [-0.15, 0, 0.15].map((o) => sig(img, bx + (i + o) * seg, by, seg, bh)).filter(Boolean),
  )
  const owned = Array(levels).fill(0)
  let lockedTiles = 0
  const cw = gw / cols, ch = gh / rows, pad = 0.06

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const s = sig(img, gx + (c + pad) * cw, gy + (r + pad) * ch, cw * (1 - 2 * pad), ch * (1 - 2 * pad))
      if (!s) continue
      if (s.locked) {
        lockedTiles++
        continue
      }
      let best = -1, bestD = maxDist
      refs.forEach((crops, i) =>
        crops.forEach((ref) => {
          const d = dist(s.vec, ref.vec)
          if (d < bestD) (best = i), (bestD = d)
        }),
      )
      if (best >= 0) owned[best]++
    }
  return { owned, lockedTiles }
}
