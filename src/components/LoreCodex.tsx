import { useMemo, useState } from 'react'
import { LORE_CATEGORIES, loreProgress } from '../game/lore'
import type { GameState, LoreCategory, LoreEntry } from '../game/types'

export function LoreCodex({ state }: { state: GameState }) {
  const [category, setCategory] = useState<LoreCategory | 'all'>('all')
  const [activeId, setActiveId] = useState<string | null>(state.lore.unlocked[0]?.id ?? null)
  const progress = loreProgress(state)

  const entries = useMemo(() => {
    const list =
      category === 'all'
        ? state.lore.unlocked
        : state.lore.unlocked.filter((e) => e.category === category)
    return list
  }, [state.lore.unlocked, category])

  const active: LoreEntry | undefined =
    entries.find((e) => e.id === activeId) ?? entries[0] ?? state.lore.unlocked[0]

  return (
    <div className="lore-engine">
      <header className="lore-engine__head">
        <div>
          <p className="badge">LORE Engine</p>
          <h2>Legends · Origins · Records · Echoes</h2>
          <p className="muted">
            Civilization memory unlocks as you explore terrain, found cities, research, quest, and
            slay world bosses.
          </p>
        </div>
        <div className="lore-progress">
          <strong>
            {progress.unlocked}/{progress.knownTotal}
          </strong>
          <span className="muted">codex depth</span>
          <div className="meter tall">
            <span
              style={{
                width: `${Math.min(100, (progress.unlocked / Math.max(1, progress.knownTotal)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className="lore-cats">
        <button
          type="button"
          className={`chip ${category === 'all' ? 'selected' : ''}`}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {LORE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${category === c.id ? 'selected' : ''}`}
            onClick={() => setCategory(c.id)}
            title={c.blurb}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="lore-layout">
        <div className="lore-list">
          {entries.length === 0 && <p className="muted">No entries in this shelf yet.</p>}
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`lore-card ${active?.id === entry.id ? 'active' : ''}`}
              onClick={() => setActiveId(entry.id)}
            >
              <span className="lore-card__cat">{entry.category}</span>
              <strong>{entry.title}</strong>
              <span className="muted">{entry.summary}</span>
            </button>
          ))}
        </div>

        {active && (
          <article className="lore-reader">
            <p className="lore-reader__cat">{active.category}</p>
            <h3>{active.title}</h3>
            <p className="lore-reader__summary">{active.summary}</p>
            <p>{active.body}</p>
            <footer>
              <span>Unlocked turn {active.unlockedAtTurn}</span>
              <span>{active.tags.join(' · ')}</span>
            </footer>
          </article>
        )}
      </div>
    </div>
  )
}
