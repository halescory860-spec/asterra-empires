import { useState } from 'react'
import { FACTIONS, HERO_CLASSES } from '../game/data'
import type { FactionId, HeroClass, SetupConfig, VictoryPath } from '../game/types'

const PATHS: { id: VictoryPath; name: string; detail: string }[] = [
  { id: 'domination', name: 'Domination', detail: 'Capture every capital city.' },
  { id: 'knowledge', name: 'Knowledge', detail: 'Finish the tech tree and build the Sky Forge.' },
  { id: 'legend', name: 'Legend', detail: 'Slay bosses, complete legendary quests, gather relics.' },
  { id: 'influence', name: 'Influence', detail: 'Reach 50 Influence through wonders and diplomacy.' },
]

export function Setup({
  onStart,
  onBack,
}: {
  onStart: (config: SetupConfig) => void
  onBack: () => void
}) {
  const [playerCount, setPlayerCount] = useState(3)
  const [humanName, setHumanName] = useState('Commander')
  const [factionId, setFactionId] = useState<FactionId>('ironLegion')
  const [heroClass, setHeroClass] = useState<HeroClass>('warrior')
  const [heroName, setHeroName] = useState('Aric')
  const [victoryPath, setVictoryPath] = useState<VictoryPath>('domination')

  return (
    <div className="setup">
      <header className="setup__header">
        <div>
          <p className="muted" style={{ margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
            ASTERRA
          </p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Choose Your Faction</h1>
        </div>
        <button className="ghost" type="button" onClick={onBack}>
          Back
        </button>
      </header>

      <div className="setup__grid">
        <section className="panel">
          <h2>Factions of Asterra</h2>
          <div className="faction-grid">
            {FACTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`faction-card ${factionId === f.id ? 'selected' : ''}`}
                style={{ ['--accent' as string]: f.accent }}
                onClick={() => setFactionId(f.id)}
              >
                <strong style={{ color: f.accent }}>{f.name}</strong>
                <p>{f.tagline}</p>
                <p className="faction-topic">
                  <span>Table Top</span> {f.tableTop}
                </p>
                <ul>
                  {f.traits.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Campaign Setup</h2>

          {(() => {
            const selected = FACTIONS.find((f) => f.id === factionId)!
            return (
              <div className="setup-tabletop">
                <p className="badge">The Table Top</p>
                <h3 style={{ color: selected.accent, margin: '0.35rem 0 0.5rem' }}>{selected.tableTop}</h3>
                <p className="muted" style={{ marginTop: 0 }}>
                  Four Legs — supporting details of this civilization:
                </p>
                <div className="setup-legs">
                  {selected.legs.map((leg) => (
                    <div key={leg.id} className="setup-leg">
                      <strong>{leg.name}</strong>
                      <span className="muted">{leg.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          <div className="field">
            <label htmlFor="ruler">Ruler name</label>
            <input id="ruler" value={humanName} onChange={(e) => setHumanName(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="hero">Hero name</label>
            <input id="hero" value={heroName} onChange={(e) => setHeroName(e.target.value)} />
          </div>

          <div className="field">
            <label>Hero class</label>
            <div className="chip-row">
              {HERO_CLASSES.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={`chip ${heroClass === h.id ? 'selected' : ''}`}
                  onClick={() => setHeroClass(h.id)}
                  title={h.description}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="players">Players (you + AI rivals)</label>
            <select
              id="players"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} players
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Victory path</label>
            <div className="faction-grid">
              {PATHS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`faction-card ${victoryPath === p.id ? 'selected' : ''}`}
                  onClick={() => setVictoryPath(p.id)}
                >
                  <strong>{p.name}</strong>
                  <p>{p.detail}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            className="primary"
            type="button"
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() =>
              onStart({
                playerCount,
                humanName,
                factionId,
                heroClass,
                heroName,
                victoryPath,
              })
            }
          >
            Begin the Campaign
          </button>
        </section>
      </div>
    </div>
  )
}
