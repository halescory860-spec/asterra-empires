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

export function hexPolygonPoints(cx: number, cy: number, size: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`)
  }
  return points.join(' ')
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
