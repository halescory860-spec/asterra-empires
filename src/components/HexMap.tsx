import { useMemo, useRef } from 'react'
import { FACTIONS, TERRAIN_META } from '../game/data'
import {
  cubeToPixel,
  hexExtrudeFaces,
  hexPolygonPoints,
  shadeColor,
  terrainHeight,
} from '../game/hex'
import type { GameState, TerrainType } from '../game/types'

function TerrainDecor({
  terrain,
  x,
  y,
  size,
}: {
  terrain: TerrainType
  x: number
  y: number
  size: number
}) {
  const s = size * 0.22
  switch (terrain) {
    case 'forest':
      return (
        <g opacity={0.55}>
          <ellipse cx={x - s} cy={y + s * 0.4} rx={s * 0.7} ry={s} fill="#1a3a1e" />
          <ellipse cx={x + s * 0.6} cy={y + s * 0.2} rx={s * 0.6} ry={s * 0.9} fill="#244a28" />
          <ellipse cx={x} cy={y - s * 0.3} rx={s * 0.75} ry={s * 1.1} fill="#2d5a32" />
        </g>
      )
    case 'mountains':
      return (
        <g opacity={0.65}>
          <polygon
            points={`${x - s * 1.4},${y + s} ${x - s * 0.2},${y - s * 1.2} ${x + s * 0.8},${y + s}`}
            fill="#4a4d55"
          />
          <polygon
            points={`${x - s * 0.3},${y + s} ${x + s * 0.7},${y - s * 0.7} ${x + s * 1.5},${y + s}`}
            fill="#5c6068"
          />
          <polygon
            points={`${x - s * 0.5},${y - s * 0.3} ${x - s * 0.2},${y - s * 1.2} ${x + s * 0.2},${y - s * 0.3}`}
            fill="#d8dde4"
            opacity={0.7}
          />
        </g>
      )
    case 'desert':
      return (
        <g opacity={0.4} stroke="#8a7040" strokeWidth={1} fill="none">
          <path d={`M${x - s * 1.3} ${y + s * 0.4} Q ${x - s * 0.4} ${y} ${x + s * 0.3} ${y + s * 0.5}`} />
          <path d={`M${x - s * 0.8} ${y + s * 0.9} Q ${x} ${y + s * 0.5} ${x + s * 1.1} ${y + s}`} />
        </g>
      )
    case 'snow':
      return (
        <g fill="#ffffff" opacity={0.55}>
          <circle cx={x - s} cy={y - s * 0.4} r={1.4} />
          <circle cx={x + s * 0.7} cy={y} r={1.2} />
          <circle cx={x} cy={y + s * 0.6} r={1.3} />
        </g>
      )
    case 'plains':
      return (
        <g opacity={0.35} stroke="#6a8a3a" strokeWidth={1} fill="none">
          <path d={`M${x - s} ${y + s * 0.6} l ${s * 0.3} ${-s * 0.7}`} />
          <path d={`M${x} ${y + s * 0.7} l ${s * 0.25} ${-s * 0.6}`} />
          <path d={`M${x + s * 0.7} ${y + s * 0.55} l ${s * 0.2} ${-s * 0.55}`} />
        </g>
      )
    case 'river':
      return (
        <path
          d={`M${x - s * 1.2} ${y - s * 0.2} Q ${x} ${y + s * 0.8} ${x + s * 1.2} ${y - s * 0.1}`}
          stroke="#7ec8e8"
          strokeWidth={2.5}
          fill="none"
          opacity={0.75}
        />
      )
    case 'swamp':
      return (
        <g opacity={0.45} fill="#6a7a3a">
          <ellipse cx={x - s * 0.5} cy={y + s * 0.5} rx={s * 0.9} ry={s * 0.35} />
          <ellipse cx={x + s * 0.6} cy={y + s * 0.2} rx={s * 0.7} ry={s * 0.28} />
        </g>
      )
    case 'ruins':
      return (
        <g opacity={0.55} fill="#5a4a35">
          <rect x={x - s * 1.1} y={y - s * 0.2} width={s * 0.55} height={s * 1.2} />
          <rect x={x - s * 0.3} y={y + s * 0.1} width={s * 0.5} height={s * 0.9} />
          <rect x={x + s * 0.45} y={y - s * 0.4} width={s * 0.45} height={s * 1.4} />
        </g>
      )
    case 'cave':
      return (
        <path
          d={`M${x - s} ${y + s * 0.6} Q ${x} ${y - s} ${x + s} ${y + s * 0.6} Z`}
          fill="#1a1412"
          opacity={0.7}
        />
      )
    case 'dungeon':
      return (
        <g opacity={0.55} stroke="#8a6078" strokeWidth={1.2} fill="none">
          <rect x={x - s * 0.8} y={y - s * 0.6} width={s * 1.6} height={s * 1.3} />
          <line x1={x} y1={y - s * 0.6} x2={x} y2={y + s * 0.7} />
        </g>
      )
    default:
      return null
  }
}

function CityMarker({
  x,
  y,
  size,
  name,
  isCapital,
  color,
  accent,
  level,
}: {
  x: number
  y: number
  size: number
  name: string
  isCapital: boolean
  color: string
  accent: string
  level: number
}) {
  const w = size * 0.85
  const h = size * 0.7
  return (
    <g className="map-marker city-marker">
      <ellipse cx={x} cy={y + h * 0.55} rx={w * 0.7} ry={h * 0.22} fill="rgba(0,0,0,0.35)" />
      {/* Keep / walls */}
      <rect x={x - w * 0.45} y={y - h * 0.15} width={w * 0.9} height={h * 0.55} fill={color} stroke={accent} strokeWidth={1.5} />
      {/* Tower */}
      <rect x={x - w * 0.12} y={y - h * 0.55} width={w * 0.24} height={h * 0.5} fill={accent} />
      <polygon
        points={`${x - w * 0.2},${y - h * 0.55} ${x},${y - h * 0.85} ${x + w * 0.2},${y - h * 0.55}`}
        fill={accent}
      />
      {/* Gate */}
      <rect x={x - w * 0.1} y={y + h * 0.05} width={w * 0.2} height={h * 0.35} fill="#1a1410" />
      {isCapital && (
        <polygon
          points={`${x},${y - h * 1.05} ${x + 3},${y - h * 0.85} ${x + 7},${y - h * 0.85} ${x + 3.5},${y - h * 0.7} ${x + 5},${y - h * 0.5} ${x},${y - h * 0.62} ${x - 5},${y - h * 0.5} ${x - 3.5},${y - h * 0.7} ${x - 7},${y - h * 0.85} ${x - 3},${y - h * 0.85}`}
          fill="#e8c99a"
          stroke="#c45c26"
          strokeWidth={0.6}
        />
      )}
      <rect
        x={x - Math.max(22, name.length * 3.2)}
        y={y + h * 0.72}
        width={Math.max(44, name.length * 6.4)}
        height={11}
        rx={2}
        fill="rgba(10,8,6,0.82)"
        stroke={accent}
        strokeWidth={0.8}
      />
      <text
        x={x}
        y={y + h * 0.72 + 8}
        textAnchor="middle"
        className="city-name"
        fill={accent}
      >
        {name}
        {level > 1 ? ` ·${level}` : ''}
      </text>
    </g>
  )
}

function SquadMarker({
  x,
  y,
  size,
  accent,
  isMine,
  label,
}: {
  x: number
  y: number
  size: number
  accent: string
  isMine: boolean
  label: string
}) {
  const r = size * 0.28
  return (
    <g className="map-marker squad-marker">
      <circle cx={x} cy={y} r={r + 2} fill="rgba(0,0,0,0.4)" />
      <circle cx={x} cy={y} r={r} fill={isMine ? accent : '#3a2a22'} stroke={accent} strokeWidth={2} />
      <text x={x} y={y + 3.5} textAnchor="middle" className="squad-glyph" fill={isMine ? '#1a1008' : accent}>
        ⚔
      </text>
      <text x={x} y={y + r + 10} textAnchor="middle" className="squad-label" fill="#f0e6d4">
        {label}
      </text>
    </g>
  )
}

function BossMarker({ x, y, size, name }: { x: number; y: number; size: number; name: string }) {
  const r = size * 0.32
  return (
    <g className="map-marker boss-marker">
      <circle cx={x} cy={y} r={r + 3} fill="rgba(120,20,20,0.35)" />
      <circle cx={x} cy={y} r={r} fill="#4a1010" stroke="#e07a3a" strokeWidth={2.2} />
      <text x={x} y={y + 4} textAnchor="middle" className="boss-glyph" fill="#e07a3a">
        ☠
      </text>
      <text x={x} y={y + r + 11} textAnchor="middle" className="boss-label" fill="#e8c99a">
        {name.split(' ')[0]}
      </text>
    </g>
  )
}

function QuestMarker({ x, y, size }: { x: number; y: number; size: number }) {
  const r = size * 0.22
  return (
    <g className="map-marker quest-marker">
      <circle cx={x} cy={y - size * 0.15} r={r} fill="#c9a227" stroke="#1a1410" strokeWidth={1.2} />
      <text x={x} y={y - size * 0.15 + 4} textAnchor="middle" className="quest-glyph" fill="#1a1008">
        !
      </text>
    </g>
  )
}

export function HexMap({
  state,
  selected,
  onSelect,
  moveHints = [],
}: {
  state: GameState
  selected: { q: number; r: number } | null
  onSelect: (q: number, r: number) => void
  moveHints?: [number, number][]
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const size = useMemo(() => {
    if (typeof window === 'undefined') return 42
    return window.matchMedia('(max-width: 700px)').matches ? 46 : 42
  }, [])

  const humanId = state.players.find((p) => p.isHuman)?.id ?? 0
  const hintSet = useMemo(() => new Set(moveHints.map(([q, r]) => `${q},${r}`)), [moveHints])

  const sortedTiles = useMemo(
    () =>
      [...state.map].sort((a, b) => {
        const pa = cubeToPixel(a.q, a.r, size)
        const pb = cubeToPixel(b.q, b.r, size)
        return pa.y - pb.y || pa.x - pb.x
      }),
    [state.map, size],
  )

  const positions = state.map.map((t) => cubeToPixel(t.q, t.r, size))
  const xs = positions.map((p) => p.x)
  const ys = positions.map((p) => p.y)
  const maxH = 20
  const pad = size * 2.8
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad - maxH
  const maxY = Math.max(...ys) + pad + 8
  const width = maxX - minX
  const height = maxY - minY
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  return (
    <div className="map-stage world-view">
      <div className="map-legend" aria-hidden>
        <span><i className="lg lg-city" /> City</span>
        <span><i className="lg lg-capital" /> Capital</span>
        <span><i className="lg lg-squad" /> Squad</span>
        <span><i className="lg lg-boss" /> Boss</span>
        <span><i className="lg lg-quest" /> Quest</span>
        <span><i className="lg lg-move" /> Can move</span>
        <span>3D world tabletop</span>
      </div>

      <div className="world-scene">
        <div className="world-sky" aria-hidden />
        <div className="world-horizon" aria-hidden />
        <div className="world-table">
          <div className="world-table__lip" aria-hidden />
          <div className="world-board">
            <svg
              className="map-svg map-svg--3d"
              width={width}
              height={height}
              viewBox={`${minX} ${minY} ${width} ${height}`}
              role="img"
              aria-label="Asterra three-dimensional world map"
            >
              <defs>
                <radialGradient id="worldGlow" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="rgba(232,201,154,0.18)" />
                  <stop offset="55%" stopColor="rgba(61,122,122,0.08)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <linearGradient id="sideShade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
                </linearGradient>
                <filter id="tileShadow" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodColor="#000" floodOpacity="0.45" />
                </filter>
              </defs>

              <ellipse
                cx={cx}
                cy={maxY - pad * 0.35}
                rx={(maxX - minX) * 0.42}
                ry={size * 1.1}
                fill="rgba(0,0,0,0.35)"
              />
              <circle cx={cx} cy={cy} r={Math.max(width, height) * 0.42} fill="url(#worldGlow)" />

              {sortedTiles.map((tile) => {
                const elev = terrainHeight(tile.terrain)
                const { x, y: baseY } = cubeToPixel(tile.q, tile.r, size)
                const y = baseY
                const topY = baseY - elev
                const explored = tile.exploredBy.includes(humanId)
                const terrain = TERRAIN_META[tile.terrain]
                const owner = tile.ownerId !== null ? state.players.find((p) => p.id === tile.ownerId) : null
                const faction = owner ? FACTIONS.find((f) => f.id === owner.factionId) : null
                const isSelected = selected?.q === tile.q && selected?.r === tile.r
                const canMove = hintSet.has(`${tile.q},${tile.r}`)
                const city = Object.values(state.cities).find((c) => c.q === tile.q && c.r === tile.r)
                const squad = Object.values(state.squads).find(
                  (s) => s.q === tile.q && s.r === tile.r && s.units.some((u) => u.hp > 0),
                )
                const boss = state.bosses.find((b) => !b.defeated && b.q === tile.q && b.r === tile.r)
                const quest = state.quests.find(
                  (q) =>
                    !q.completed &&
                    q.locationQ === tile.q &&
                    q.locationR === tile.r &&
                    (q.acceptedBy === humanId || q.acceptedBy === null),
                )

                const fill = explored ? terrain.color : '#14110e'
                const stroke = isSelected
                  ? '#e8c99a'
                  : canMove
                    ? '#5aa0a0'
                    : faction?.accent ?? 'rgba(212,165,116,0.35)'
                const faces = hexExtrudeFaces(x, y, size - 1.2, elev)

                return (
                  <g
                    key={`${tile.q},${tile.r}`}
                    className="hex-prism"
                    filter="url(#tileShadow)"
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
                      if (dx < 12 && dy < 12) {
                        e.preventDefault()
                        onSelect(tile.q, tile.r)
                      }
                    }}
                  >
                    <polygon points={faces.left} fill={shadeColor(fill, -40)} opacity={explored ? 0.95 : 0.4} />
                    <polygon points={faces.bottom} fill={shadeColor(fill, -55)} opacity={explored ? 0.95 : 0.4} />
                    <polygon points={faces.right} fill={shadeColor(fill, -25)} opacity={explored ? 0.95 : 0.4} />
                    <polygon points={faces.left} fill="url(#sideShade)" opacity={0.35} />
                    <polygon points={faces.right} fill="url(#sideShade)" opacity={0.2} />

                    <polygon
                      className={`hex ${isSelected ? 'selected' : ''} ${owner ? 'owned' : ''} ${canMove ? 'movable' : ''}`}
                      points={hexPolygonPoints(x, topY, size - 1.2)}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 3 : canMove ? 2.4 : owner ? 2 : 1.2}
                      opacity={explored ? 1 : 0.45}
                    />
                    <polygon
                      points={hexPolygonPoints(x, topY - 0.8, size - 3.8)}
                      fill="none"
                      stroke="rgba(255,255,255,0.16)"
                      strokeWidth={1}
                      opacity={explored ? 1 : 0.25}
                    />

                    {explored && <TerrainDecor terrain={tile.terrain} x={x} y={topY} size={size} />}

                    {explored && !city && tile.resource && (
                      <circle
                        cx={x + size * 0.32}
                        cy={topY - size * 0.32}
                        r={3.2}
                        fill="#e8c99a"
                        stroke="#1a1410"
                        strokeWidth={0.8}
                      />
                    )}

                    {explored && !city && !squad && !boss && (
                      <text
                        x={x}
                        y={topY + size * 0.5}
                        textAnchor="middle"
                        className="terrain-abbr"
                        fill="rgba(240,230,212,0.75)"
                      >
                        {terrain.label.slice(0, 3)}
                      </text>
                    )}

                    {!explored && (
                      <text x={x} y={topY + 3} textAnchor="middle" className="fog-label" fill="rgba(168,152,128,0.55)">
                        ?
                      </text>
                    )}

                    {explored && quest && !city && (
                      <QuestMarker x={x + size * 0.28} y={topY - size * 0.2} size={size} />
                    )}

                    {explored && boss && !city && <BossMarker x={x} y={topY} size={size} name={boss.name} />}

                    {explored && squad && !city && (
                      <SquadMarker
                        x={x}
                        y={boss ? topY + size * 0.35 : topY}
                        size={size}
                        accent={
                          FACTIONS.find(
                            (f) => f.id === state.players.find((p) => p.id === squad.ownerId)?.factionId,
                          )?.accent ?? '#d4a574'
                        }
                        isMine={squad.ownerId === humanId}
                        label={squad.ownerId === humanId ? 'You' : 'Enemy'}
                      />
                    )}

                    {explored && city && (
                      <CityMarker
                        x={x}
                        y={topY - size * 0.08}
                        size={size}
                        name={city.name}
                        isCapital={city.isCapital === city.ownerId}
                        color={
                          FACTIONS.find(
                            (f) => f.id === state.players.find((p) => p.id === city.ownerId)?.factionId,
                          )?.color ?? '#5a4030'
                        }
                        accent={
                          FACTIONS.find(
                            (f) => f.id === state.players.find((p) => p.id === city.ownerId)?.factionId,
                          )?.accent ?? '#d4a574'
                        }
                        level={city.level}
                      />
                    )}

                    {explored && city && squad && (
                      <SquadMarker
                        x={x + size * 0.42}
                        y={topY + size * 0.42}
                        size={size * 0.75}
                        accent={
                          FACTIONS.find(
                            (f) => f.id === state.players.find((p) => p.id === squad.ownerId)?.factionId,
                          )?.accent ?? '#d4a574'
                        }
                        isMine={squad.ownerId === humanId}
                        label=""
                      />
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
