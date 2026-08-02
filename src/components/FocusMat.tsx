import type { FocusAction } from '../game/types'

const ACTIONS: { id: FocusAction; label: string; hint: string }[] = [
  { id: 'expand', label: 'Expand', hint: 'Move squads, claim tiles, found cities' },
  { id: 'build', label: 'Build', hint: 'Construct city buildings and wonders' },
  { id: 'research', label: 'Research', hint: 'Advance science & culture on the Tech Mat' },
  { id: 'quest', label: 'Quest', hint: 'Accept and complete legendary missions' },
  { id: 'lore', label: 'LORE', hint: 'Legends, Origins, Records, Echoes codex' },
  { id: 'diplomacy', label: 'Diplomacy', hint: 'Alliances, peace, and war' },
  { id: 'dashboard', label: 'Dashboard', hint: 'Resources, military, population, four legs' },
]

export function FocusMat({
  active,
  onSelect,
  locked,
}: {
  active: FocusAction
  onSelect: (action: FocusAction) => void
  locked?: boolean
}) {
  return (
    <section className="focus-mat" aria-label="Focus mat">
      <div className="focus-mat__head">
        <h2>Focus Mat</h2>
        <p className="muted">Choose your action this turn. Each slot opens that track.</p>
      </div>
      <div className="focus-track">
        {ACTIONS.map((action, index) => (
          <button
            key={action.id}
            type="button"
            className={`focus-slot ${active === action.id ? 'active' : ''}`}
            disabled={locked && action.id !== 'dashboard' && action.id !== 'lore'}
            onClick={() => onSelect(action.id)}
          >
            <span className="focus-slot__index">{index + 1}</span>
            <strong>{action.label}</strong>
            <span className="muted">{action.hint}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
