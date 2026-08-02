import { TECH_TREE } from '../game/data'
import type { GameState, TechCategory } from '../game/types'

const TRACKS: { id: TechCategory; title: string; subtitle: string }[] = [
  { id: 'military', title: 'Military Track', subtitle: 'Scientific arms and war engines' },
  { id: 'magic', title: 'Culture & Magic Track', subtitle: 'Arcane and cultural advancements' },
  { id: 'civilization', title: 'Civilization Track', subtitle: 'Government, farming, medicine, democracy' },
]

export function TechnologyMat({
  state,
  humanId,
  isMyTurn,
  onResearch,
}: {
  state: GameState
  humanId: number
  isMyTurn: boolean
  onResearch: (id: string) => void
}) {
  const player = state.players.find((p) => p.id === humanId)!

  return (
    <div className="tech-mat">
      <h2>Technology Mat</h2>
      <p className="muted">
        Visual research tracks for scientific and cultural advancements. Research points:{' '}
        <b>{player.researchPoints}</b>
      </p>

      {TRACKS.map((track) => {
        const nodes = TECH_TREE.filter((t) => t.category === track.id)
        const done = nodes.filter((t) => player.researched.includes(t.id)).length
        return (
          <section key={track.id} className="tech-track">
            <header className="tech-track__head">
              <div>
                <h3>{track.title}</h3>
                <p className="muted">{track.subtitle}</p>
              </div>
              <span className="badge">
                {done}/{nodes.length}
              </span>
            </header>
            <div className="tech-nodes">
              {nodes.map((t, i) => {
                const owned = player.researched.includes(t.id)
                const locked = !t.requires.every((r) => player.researched.includes(r))
                const affordable = player.researchPoints >= t.cost
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`tech-node ${owned ? 'owned' : ''} ${locked ? 'locked' : ''}`}
                    disabled={!isMyTurn || owned || locked || !affordable}
                    onClick={() => onResearch(t.id)}
                  >
                    <span className="tech-node__step">{i + 1}</span>
                    <strong>{t.name}</strong>
                    <span className="muted">{t.description}</span>
                    <span className="tech-node__cost">{owned ? 'Unlocked' : `${t.cost} RP`}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
