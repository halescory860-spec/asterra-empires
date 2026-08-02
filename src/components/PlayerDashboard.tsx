import { RESOURCE_LABELS } from '../game/data'
import { dashboardStats } from '../game/tabletop'
import type { FactionDef, GameState, Player, ResourceType } from '../game/types'
import { TableTopBoard } from './TableTopBoard'

const CHART_RESOURCES: ResourceType[] = ['food', 'wood', 'stone', 'iron', 'gold', 'mana', 'oil', 'dragonScales']

export function PlayerDashboard({
  state,
  player,
  faction,
}: {
  state: GameState
  player: Player
  faction: FactionDef
}) {
  const stats = dashboardStats(state, player)
  const maxResource = Math.max(1, ...CHART_RESOURCES.map((r) => player.resources[r]))

  return (
    <div className="dashboard">
      <TableTopBoard faction={faction} state={state} player={player} />

      <h2 className="dash-title">Player Dashboard</h2>
      <p className="muted">Track resources, military strength, and population for {faction.name}.</p>

      <div className="dash-kpis">
        <div className="kpi">
          <span>Military Strength</span>
          <strong>{stats.militaryStrength}</strong>
          <div className="meter">
            <span style={{ width: `${Math.min(100, stats.militaryStrength)}%`, background: faction.accent }} />
          </div>
        </div>
        <div className="kpi">
          <span>Population</span>
          <strong>{stats.population}</strong>
          <div className="meter">
            <span style={{ width: `${Math.min(100, stats.population * 2)}%`, background: '#5aa0a0' }} />
          </div>
        </div>
        <div className="kpi">
          <span>Cities / Squads</span>
          <strong>
            {stats.cityCount} / {stats.squadCount}
          </strong>
        </div>
        <div className="kpi">
          <span>Tech Progress</span>
          <strong>
            {stats.researchDone}/{stats.researchMax}
          </strong>
          <div className="meter">
            <span
              style={{
                width: `${(stats.researchDone / Math.max(1, stats.researchMax)) * 100}%`,
                background: '#c9a227',
              }}
            />
          </div>
        </div>
      </div>

      <h3 className="dash-subtitle">Resource Chart</h3>
      <div className="resource-chart" role="img" aria-label="Resource bars">
        {CHART_RESOURCES.map((key) => {
          const value = player.resources[key]
          const pct = Math.round((value / maxResource) * 100)
          return (
            <div key={key} className="resource-bar">
              <div className="resource-bar__label">
                <span>{RESOURCE_LABELS[key]}</span>
                <b>{value}</b>
              </div>
              <div className="meter tall">
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
