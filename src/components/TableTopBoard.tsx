import { legScores } from '../game/tabletop'
import type { FactionDef, GameState, Player } from '../game/types'

export function TableTopBoard({
  faction,
  state,
  player,
}: {
  faction: FactionDef
  state: GameState
  player: Player
}) {
  const scores = legScores(state, player)

  return (
    <section className="tabletop-board" aria-label="Civilization table top">
      <div className="tabletop-board__scene">
        <div className="tabletop-board__surface">
          <div className="tabletop-globe" aria-hidden>
            <span className="tabletop-globe__orb" style={{ borderColor: faction.accent }} />
          </div>
          <p className="tabletop-board__eyebrow">The Table Top</p>
          <h2 className="tabletop-board__topic">{faction.tableTop}</h2>
          <p className="muted">
            Main topic of your faction — viewed as the world upon the table. The four legs hold it up.
          </p>
        </div>
        <div className="tabletop-legs tabletop-legs--3d">
          {faction.legs.map((leg) => (
            <article key={leg.id} className="table-leg">
              <header>
                <strong>{leg.name}</strong>
                <span>{scores[leg.id]}%</span>
              </header>
              <p>{leg.detail}</p>
              <div className="meter" aria-hidden>
                <span style={{ width: `${scores[leg.id]}%`, background: faction.accent }} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
