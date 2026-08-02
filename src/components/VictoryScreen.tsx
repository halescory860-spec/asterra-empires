import { FACTIONS } from '../game/data'
import type { GameState } from '../game/types'

export function VictoryScreen({
  state,
  onRestart,
}: {
  state: GameState
  onRestart: () => void
}) {
  const winner = state.players.find((p) => p.id === state.winnerId)
  const faction = winner ? FACTIONS.find((f) => f.id === winner.factionId) : null

  return (
    <section className="victory">
      <div>
        <p className="badge">Campaign Complete</p>
        <h1>ASTERRA</h1>
        <p style={{ color: faction?.accent ?? 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}>
          {winner?.name ?? 'A legend'} prevails
        </p>
        <p>{state.winReason}</p>
        <button className="primary" type="button" style={{ marginTop: '1.5rem' }} onClick={onRestart}>
          Return to Title
        </button>
      </div>
    </section>
  )
}
