import {
  combatAction,
} from '../game/engine'
import { UNIT_ROLES } from '../game/data'
import type { GameState } from '../game/types'

export function CombatScreen({
  state,
  apply,
}: {
  state: GameState
  apply: (fn: (s: GameState) => GameState) => void
}) {
  const combat = state.combat!
  const atk = state.squads[combat.attackerSquadId]!
  const def = combat.defenderSquadId ? state.squads[combat.defenderSquadId] : null
  const boss = combat.bossId ? state.bosses.find((b) => b.id === combat.bossId) : null
  const atkPlayer = state.players.find((p) => p.id === combat.attackerId)!

  return (
    <div className="combat">
      <div className="combat__panel">
        <p className="badge">Squad Combat</p>
        <h1>Battle of Asterra</h1>
        <p className="muted">
          {atkPlayer.name} leads {atk.name}
          {boss ? ` against ${boss.name}` : def ? ` against ${def.name}` : ''}. Use cover, high
          ground, flanking, and suppression.
        </p>

        {boss && (
          <div>
            <div className="stat-row">
              <span>{boss.name}</span>
              <span>
                {boss.hp}/{boss.maxHp} HP
              </span>
            </div>
            <div className="progress">
              <span style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="unit-grid">
          {atk.units.map((u) => (
            <div key={u.id} className={`unit-card ${u.hp <= 0 ? 'dead' : ''}`}>
              <strong>{UNIT_ROLES[u.role].name}</strong>
              <div>
                {u.hp}/{u.maxHp} HP
              </div>
              <div className="muted">
                {u.inCover ? 'Cover' : 'Open'}
                {u.highGround ? ' · High ground' : ''}
                {u.suppressed ? ' · Suppressed' : ''}
              </div>
            </div>
          ))}
        </div>

        {def && (
          <>
            <h3 style={{ color: 'var(--gold)', marginTop: '0.5rem' }}>Enemy Squad</h3>
            <div className="unit-grid">
              {def.units.map((u) => (
                <div key={u.id} className={`unit-card ${u.hp <= 0 ? 'dead' : ''}`}>
                  <strong>{UNIT_ROLES[u.role].name}</strong>
                  <div>
                    {u.hp}/{u.maxHp} HP
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="combat-log">
          {combat.log.map((line, i) => (
            <div key={`${line}-${i}`}>{line}</div>
          ))}
        </div>

        <div className="combat-actions">
          <button className="primary" type="button" onClick={() => apply((s) => combatAction(s, 'strike'))}>
            Strike
          </button>
          <button type="button" onClick={() => apply((s) => combatAction(s, 'flank'))}>
            Flank
          </button>
          <button type="button" onClick={() => apply((s) => combatAction(s, 'cover'))}>
            Take Cover
          </button>
          <button type="button" onClick={() => apply((s) => combatAction(s, 'heal'))}>
            Heal
          </button>
          <button className="ghost" type="button" onClick={() => apply((s) => combatAction(s, 'flee'))}>
            Withdraw
          </button>
        </div>
      </div>
    </div>
  )
}
