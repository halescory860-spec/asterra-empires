import type { HexTile } from './types'

export function hexKey(q: number, r: number): string {
  return `${q},${r}`
}

export function axialDistance(aq: number, ar: number, bq: number, br: number): number {
  return (Math.abs(aq - bq) + Math.abs(aq + ar - bq - br) + Math.abs(ar - br)) / 2
}

export function hexNeighbors(q: number, r: number): [number, number][] {
  return [
    [q + 1, r],
    [q + 1, r - 1],
    [q, r - 1],
    [q - 1, r],
    [q - 1, r + 1],
    [q, r + 1],
  ]
}

export function cubeToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r)
  const y = size * ((3 / 2) * r)
  return { x, y }
}

export function hexCorners(cx: number, cy: number, size: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    points.push({ x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) })
  }
  return points
}

export function hexPolygonPoints(cx: number, cy: number, size: number): string {
  return hexCorners(cx, cy, size)
    .map((p) => `${p.x},${p.y}`)
    .join(' ')
}

/** Side wall quads for a faux-3D hex prism (south-east / south-west faces). */
export function hexExtrudeFaces(
  cx: number,
  cy: number,
  size: number,
  height: number,
): { left: string; right: string; bottom: string } {
  const top = hexCorners(cx, cy - height, size)
  const bot = hexCorners(cx, cy, size)
  // Faces visible from a top-front camera: indices 0-1 (SE), 1-2 (S), 5-0 (SW-ish for pointy-top)
  const face = (a: number, b: number) =>
    `${bot[a]!.x},${bot[a]!.y} ${bot[b]!.x},${bot[b]!.y} ${top[b]!.x},${top[b]!.y} ${top[a]!.x},${top[a]!.y}`
  return {
    right: face(0, 1),
    bottom: face(1, 2),
    left: face(5, 0),
  }
}

export function terrainHeight(terrain: string): number {
  switch (terrain) {
    case 'mountains':
      return 18
    case 'snow':
      return 14
    case 'forest':
      return 10
    case 'ruins':
    case 'dungeon':
      return 9
    case 'cave':
      return 8
    case 'desert':
      return 6
    case 'swamp':
      return 4
    case 'river':
      return 3
    case 'plains':
    default:
      return 5
  }
}

/** Darken a hex color for extruded side walls. */
export function shadeColor(hex: string, amount: number): string {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return hex
  const n = parseInt(raw, 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount))
  const b = Math.max(0, Math.min(255, (n & 255) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export function findTile(map: HexTile[], q: number, r: number): HexTile | undefined {
  return map.find((t) => t.q === q && t.r === r)
}

export function tilesInRadius(radius: number): [number, number][] {
  const tiles: [number, number][] = []
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (axialDistance(0, 0, q, r) <= radius) tiles.push([q, r])
    }
  }
  return tiles
}
