import { useMemo, useRef } from 'react'
import { FACTIONS, TERRAIN_META } from '../game/data'
import { cubeToPixel, hexPolygonPoints } from '../game/hex'
import type { GameState } from '../game/types'

export function HexMap({
  state,
  selected,
  onSelect,
}: {
  state: GameState
  selected: { q: number; r: number } | null
  onSelect: (q: number, r: number) => void
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  // Larger hexes on phones for reliable finger taps.
  const size = useMemo(() => {
    if (typeof window === 'undefined') return 28
    return window.matchMedia('(max-width: 700px)').matches ? 34 : 28
  }, [])

  const humanId = state.players.find((p) => p.isHuman)?.id ?? 0
  const positions = state.map.map((t) => cubeToPixel(t.q, t.r, size))
  const xs = positions.map((p) => p.x)
  const ys = positions.map((p) => p.y)
  const pad = size * 2
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const width = maxX - minX
  const height = maxY - minY

  return (
    <svg
      className="map-svg"
      width={width}
      height={height}
      viewBox={`${minX} ${minY} ${width} ${height}`}
      role="img"
      aria-label="Asterra hex map"
    >
      {state.map.map((tile) => {
        const { x, y } = cubeToPixel(tile.q, tile.r, size)
        const explored = tile.exploredBy.includes(humanId)
        const terrain = TERRAIN_META[tile.terrain]
        const owner = tile.ownerId !== null ? state.players.find((p) => p.id === tile.ownerId) : null
        const faction = owner ? FACTIONS.find((f) => f.id === owner.factionId) : null
        const isSelected = selected?.q === tile.q && selected?.r === tile.r
        const city = Object.values(state.cities).find((c) => c.q === tile.q && c.r === tile.r)
        const squad = Object.values(state.squads).find(
          (s) => s.q === tile.q && s.r === tile.r && s.units.some((u) => u.hp > 0),
        )
        const boss = state.bosses.find((b) => !b.defeated && b.q === tile.q && b.r === tile.r)
        const quest = state.quests.find(
          (q) => !q.completed && q.locationQ === tile.q && q.locationR === tile.r,
        )

        const fill = explored ? terrain.color : '#1a1612'
        const stroke = faction?.accent ?? 'rgba(212,165,116,0.25)'

        return (
          <g
            key={`${tile.q},${tile.r}`}
            onClick={() => onSelect(tile.q, tile.r)}
            onTouchStart={(e) => {
              const t = e.changedTouches[0]
              if (t) touchStart.current = { x: t.clientX, y: t.clientY }
            }}
            onTouchEnd={(e) => {
              const start = touchStart.current
              const t = e.changedTouches[0]
              touchStart.current = null
              if (!start || !t) return
              const dx = Math.abs(t.clientX - start.x)
              const dy = Math.abs(t.clientY - start.y)
              // Treat as tap only when the finger barely moved (allow map pan).
              if (dx < 12 && dy < 12) {
                e.preventDefault()
                onSelect(tile.q, tile.r)
              }
            }}
          >
            <polygon
              className={`hex ${isSelected ? 'selected' : ''} ${owner ? 'owned' : ''}`}
              points={hexPolygonPoints(x, y, size - 1)}
              fill={fill}
              stroke={isSelected ? undefined : stroke}
              strokeWidth={owner ? 2 : 1}
              opacity={explored ? 1 : 0.55}
            />
            {explored && (
              <text className="hex-label" x={x} y={y + 3} textAnchor="middle">
                {city ? '▣' : squad ? '⚔' : boss ? '☠' : quest ? '?' : tile.resource ? '·' : ''}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
