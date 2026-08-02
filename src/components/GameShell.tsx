import { useState } from 'react'
import {
  acceptQuest,
  buildInCity,
  buildWonderInfluence,
  claimTile,
  craftItem,
  endTurn,
  foundCity,
  learnPerk,
  moveSquad,
  recruitUnit,
  researchTech,
  setDiplomacy,
} from '../game/engine'
import {
  BUILDINGS,
  CRAFT_RECIPES,
  FACTIONS,
  HERO_PERKS,
  RESOURCE_LABELS,
  TECH_TREE,
  TERRAIN_META,
  UNIT_ROLES,
} from '../game/data'
import { axialDistance, findTile, hexNeighbors } from '../game/hex'
import type { BuildingType, GameState, UnitRole } from '../game/types'
import { HexMap } from './HexMap'

type Tab = 'realm' | 'city' | 'hero' | 'quests' | 'tech' | 'craft' | 'diplomacy'

export function GameShell({
  state,
  apply,
  onResign,
}: {
  state: GameState
  apply: (fn: (s: GameState) => GameState) => void
  onResign: () => void
}) {
  const [tab, setTab] = useState<Tab>('realm')
  const [selected, setSelected] = useState<{ q: number; r: number } | null>(() => {
    const capital = Object.values(state.cities).find((c) => c.ownerId === state.players.find((p) => p.isHuman)?.id)
    return capital ? { q: capital.q, r: capital.r } : null
  })
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(() => {
    const humanPlayer = state.players.find((p) => p.isHuman)
    return humanPlayer?.squads[0] ?? null
  })

  const human = state.players.find((p) => p.isHuman)!
  const active = state.players.find((p) => p.id === state.activePlayerId)!
  const isMyTurn = active.isHuman
  const faction = FACTIONS.find((f) => f.id === human.factionId)!

  const selectedTile = selected ? findTile(state.map, selected.q, selected.r) : null
  const selectedCity = selected
    ? Object.values(state.cities).find((c) => c.q === selected.q && c.r === selected.r)
    : null
  const selectedSquad = selected
    ? Object.values(state.squads).find((s) => s.q === selected.q && s.r === selected.r)
    : selectedSquadId
      ? state.squads[selectedSquadId]
      : null

  const mySquads = human.squads.map((id) => state.squads[id]!).filter(Boolean)

  const activeSquad =
    (selectedSquadId && state.squads[selectedSquadId]) ||
    (selectedSquad && selectedSquad.ownerId === human.id ? selectedSquad : null) ||
    mySquads[0] ||
    null

  const moveHints: [number, number][] =
    isMyTurn && activeSquad && activeSquad.ownerId === human.id && activeSquad.movesLeft > 0
      ? hexNeighbors(activeSquad.q, activeSquad.r).filter(([q, r]) => !!findTile(state.map, q, r))
      : []

  const onSelect = (q: number, r: number) => {
    const squadHere = Object.values(state.squads).find((s) => s.q === q && s.r === r)
    if (squadHere && squadHere.ownerId === human.id) {
      setSelectedSquadId(squadHere.id)
    }

    // Move if clicking adjacent hex with a selected squad
    if (
      isMyTurn &&
      selectedSquadId &&
      state.squads[selectedSquadId] &&
      state.squads[selectedSquadId]!.ownerId === human.id &&
      axialDistance(state.squads[selectedSquadId]!.q, state.squads[selectedSquadId]!.r, q, r) === 1
    ) {
      apply((s) => moveSquad(s, selectedSquadId, q, r))
      setSelected({ q, r })
      return
    }

    setSelected({ q, r })
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'realm', label: 'Realm' },
    { id: 'city', label: 'City' },
    { id: 'hero', label: 'Hero' },
    { id: 'quests', label: 'Quests' },
    { id: 'tech', label: 'Tech' },
    { id: 'craft', label: 'Craft' },
    { id: 'diplomacy', label: 'Diplomacy' },
  ]

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__brand">ASTERRA</div>
        <div className="resources">
          {(Object.keys(RESOURCE_LABELS) as (keyof typeof RESOURCE_LABELS)[]).map((key) => (
            <span key={key}>
              {RESOURCE_LABELS[key]} <b>{human.resources[key]}</b>
            </span>
          ))}
          <span>
            Research <b>{human.researchPoints}</b>
          </span>
          <span>
            Influence <b>{human.influence}</b>
          </span>
        </div>
        <div className="muted">
          Turn {state.turn} · {isMyTurn ? 'Your move' : `${active.name} acts`} · {faction.name}
        </div>
      </header>

      <div className="shell__main">
        <div className="map-wrap">
          <HexMap
            state={state}
            selected={selected}
            onSelect={onSelect}
            moveHints={moveHints}
          />
        </div>

        <aside className="sidebar">
          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? 'active' : ''}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="sidebar__body">
            {tab === 'realm' && (
              <RealmPanel
                state={state}
                humanId={human.id}
                selectedTile={selectedTile}
                selectedSquad={selectedSquad ?? null}
                isMyTurn={isMyTurn}
                onClaim={() => selected && apply((s) => claimTile(s, selected.q, selected.r))}
                onFound={() =>
                  selectedSquad &&
                  selectedSquad.ownerId === human.id &&
                  apply((s) => foundCity(s, selectedSquad.id))
                }
                onRecruit={(role) =>
                  selectedSquad &&
                  selectedSquad.ownerId === human.id &&
                  apply((s) => recruitUnit(s, selectedSquad.id, role))
                }
                onSelectSquad={(id) => {
                  setSelectedSquadId(id)
                  const sq = state.squads[id]
                  if (sq) setSelected({ q: sq.q, r: sq.r })
                }}
                mySquads={mySquads}
              />
            )}

            {tab === 'city' && (
              <CityPanel
                state={state}
                humanId={human.id}
                selectedCityId={selectedCity?.ownerId === human.id ? selectedCity.id : human.cities[0]}
                isMyTurn={isMyTurn}
                onBuild={(cityId, building) => apply((s) => buildInCity(s, cityId, building))}
                onWonder={() => apply((s) => buildWonderInfluence(s))}
              />
            )}

            {tab === 'hero' && (
              <HeroPanel
                state={state}
                humanId={human.id}
                isMyTurn={isMyTurn}
                onPerk={(id) => apply((s) => learnPerk(s, id))}
              />
            )}

            {tab === 'quests' && (
              <QuestPanel
                state={state}
                humanId={human.id}
                isMyTurn={isMyTurn}
                onAccept={(id) => apply((s) => acceptQuest(s, id))}
              />
            )}

            {tab === 'tech' && (
              <TechPanel
                state={state}
                humanId={human.id}
                isMyTurn={isMyTurn}
                onResearch={(id) => apply((s) => researchTech(s, id))}
              />
            )}

            {tab === 'craft' && (
              <CraftPanel
                state={state}
                humanId={human.id}
                isMyTurn={isMyTurn}
                onCraft={(id) => apply((s) => craftItem(s, id))}
              />
            )}

            {tab === 'diplomacy' && (
              <DiplomacyPanel
                state={state}
                humanId={human.id}
                isMyTurn={isMyTurn}
                onSet={(id, status) => apply((s) => setDiplomacy(s, id, status))}
              />
            )}
          </div>

          <div className="log">
            <ul>
              {state.eventLog.slice(0, 8).map((line, i) => (
                <li key={`${i}-${line.slice(0, 12)}`}>{line}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="action-bar">
        <button
          className="primary"
          type="button"
          disabled={!isMyTurn}
          onClick={() => apply((s) => endTurn(s))}
        >
          End Turn
        </button>
        <span className="muted" style={{ alignSelf: 'center' }}>
          Path: {human.victoryPath} · Bosses {human.bossesDefeated}/3 · Relics {human.relics}/6 ·
          Legendary quests {human.legendaryQuests}/5
        </span>
        <button className="ghost" type="button" onClick={onResign} style={{ marginLeft: 'auto' }}>
          Abandon Campaign
        </button>
      </div>
    </div>
  )
}

function RealmPanel({
  state,
  humanId,
  selectedTile,
  selectedSquad,
  isMyTurn,
  onClaim,
  onFound,
  onRecruit,
  onSelectSquad,
  mySquads,
}: {
  state: GameState
  humanId: number
  selectedTile: GameState['map'][number] | null | undefined
  selectedSquad: GameState['squads'][string] | null
  isMyTurn: boolean
  onClaim: () => void
  onFound: () => void
  onRecruit: (role: UnitRole) => void
  onSelectSquad: (id: string) => void
  mySquads: GameState['squads'][string][]
}) {
  const boss = selectedTile
    ? state.bosses.find((b) => !b.defeated && b.q === selectedTile.q && b.r === selectedTile.r)
    : null
  const cityHere = selectedTile
    ? Object.values(state.cities).find((c) => c.q === selectedTile.q && c.r === selectedTile.r)
    : null
  const questHere = selectedTile
    ? state.quests.find(
        (q) => !q.completed && q.locationQ === selectedTile.q && q.locationR === selectedTile.r,
      )
    : null

  return (
    <div>
      <h2 style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '0.75rem' }}>Hex & Squads</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Cities show as keeps with names. Teal outline = legal move. Tap a squad, then an outlined hex.
      </p>
      {selectedTile ? (
        <>
          {cityHere && (
            <div className="inspect-card">
              <strong style={{ color: 'var(--gold)' }}>
                {cityHere.isCapital === cityHere.ownerId ? 'Capital · ' : 'City · '}
                {cityHere.name}
              </strong>
              <div className="stat-row">
                <span>Owner</span>
                <strong>{state.players.find((p) => p.id === cityHere.ownerId)?.name}</strong>
              </div>
              <div className="stat-row">
                <span>Level</span>
                <strong>{cityHere.level}</strong>
              </div>
              <div className="stat-row">
                <span>Buildings</span>
                <strong>{cityHere.buildings.map((b) => BUILDINGS[b].name).join(', ')}</strong>
              </div>
            </div>
          )}
          <div className="stat-row">
            <span>Terrain</span>
            <strong>{TERRAIN_META[selectedTile.terrain].label}</strong>
          </div>
          <div className="stat-row">
            <span>Resource</span>
            <strong>{selectedTile.resource ? RESOURCE_LABELS[selectedTile.resource] : 'None'}</strong>
          </div>
          <div className="stat-row">
            <span>Controller</span>
            <strong>
              {selectedTile.ownerId === null
                ? 'Wild'
                : state.players.find((p) => p.id === selectedTile.ownerId)?.name}
            </strong>
          </div>
          {selectedSquad && (
            <div className="inspect-card">
              <strong>Squad · {selectedSquad.name}</strong>
              <div className="muted">
                {selectedSquad.units.filter((u) => u.hp > 0).length} living · moves {selectedSquad.movesLeft}
              </div>
            </div>
          )}
          {boss && (
            <p className="muted">
              Boss here: {boss.name} ({boss.hp}/{boss.maxHp})
            </p>
          )}
          {questHere && (
            <p className="muted">
              Quest here: {questHere.title}
              {questHere.acceptedBy === humanId ? ' (accepted)' : ''}
            </p>
          )}
        </>
      ) : (
        <p className="muted">Select a hex on the map. Select your squad, then click an adjacent hex to move.</p>
      )}

      <div className="list-actions">
        <button type="button" disabled={!isMyTurn || !selectedTile} onClick={onClaim}>
          Claim Hex
        </button>
        <button
          type="button"
          disabled={!isMyTurn || !selectedSquad || selectedSquad.ownerId !== humanId}
          onClick={onFound}
        >
          Found City Here
        </button>
      </div>

      <h3 style={{ marginTop: '1.25rem', color: 'var(--gold)', fontSize: '0.95rem' }}>Your Squads</h3>
      <div className="list-actions">
        {mySquads.map((sq) => (
          <button key={sq.id} type="button" onClick={() => onSelectSquad(sq.id)}>
            {sq.name} · ({sq.q},{sq.r}) · moves {sq.movesLeft} ·{' '}
            {sq.units.filter((u) => u.hp > 0).length} units
          </button>
        ))}
      </div>

      {selectedSquad && selectedSquad.ownerId === humanId && (
        <>
          <h3 style={{ marginTop: '1.25rem', color: 'var(--gold)', fontSize: '0.95rem' }}>
            Recruit (4-unit squads)
          </h3>
          <div className="chip-row" style={{ marginTop: '0.5rem' }}>
            {(Object.keys(UNIT_ROLES) as UnitRole[]).map((role) => (
              <button
                key={role}
                type="button"
                className="chip"
                disabled={!isMyTurn}
                onClick={() => onRecruit(role)}
              >
                {UNIT_ROLES[role].name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CityPanel({
  state,
  humanId,
  selectedCityId,
  isMyTurn,
  onBuild,
  onWonder,
}: {
  state: GameState
  humanId: number
  selectedCityId?: string
  isMyTurn: boolean
  onBuild: (cityId: string, building: BuildingType) => void
  onWonder: () => void
}) {
  const cities = Object.values(state.cities).filter((c) => c.ownerId === humanId)
  const city = cities.find((c) => c.id === selectedCityId) ?? cities[0]
  if (!city) return <p className="muted">No cities under your banner.</p>

  return (
    <div>
      <h2 style={{ color: 'var(--gold)', fontSize: '1rem' }}>{city.name}</h2>
      <div className="stat-row">
        <span>Level</span>
        <strong>{city.level}</strong>
      </div>
      <div className="stat-row">
        <span>Buildings</span>
        <strong>{city.buildings.length}</strong>
      </div>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        {city.buildings.map((b) => BUILDINGS[b].name).join(' · ') || 'None'}
      </p>

      <h3 style={{ marginTop: '1rem', color: 'var(--gold)', fontSize: '0.95rem' }}>Construct</h3>
      <div className="list-actions">
        {(Object.keys(BUILDINGS) as BuildingType[]).map((b) => {
          const def = BUILDINGS[b]
          const owned = city.buildings.includes(b)
          return (
            <button
              key={b}
              type="button"
              disabled={!isMyTurn || owned || city.level < def.unlockLevel}
              onClick={() => onBuild(city.id, b)}
            >
              {def.name} — {def.effect}
              {owned ? ' (built)' : city.level < def.unlockLevel ? ` (lv ${def.unlockLevel})` : ''}
            </button>
          )
        })}
        <button type="button" disabled={!isMyTurn} onClick={onWonder}>
          Raise a Wonder (+10 Influence)
        </button>
      </div>

      {cities.length > 1 && (
        <p className="muted" style={{ marginTop: '1rem' }}>
          Other cities: {cities.map((c) => c.name).join(', ')}
        </p>
      )}
    </div>
  )
}

function HeroPanel({
  state,
  humanId,
  isMyTurn,
  onPerk,
}: {
  state: GameState
  humanId: number
  isMyTurn: boolean
  onPerk: (id: string) => void
}) {
  const player = state.players.find((p) => p.id === humanId)!
  const { hero } = player

  return (
    <div>
      <h2 style={{ color: 'var(--gold)', fontSize: '1rem' }}>{hero.name}</h2>
      <div className="stat-row">
        <span>Class</span>
        <strong style={{ textTransform: 'capitalize' }}>{hero.class}</strong>
      </div>
      <div className="stat-row">
        <span>Level</span>
        <strong>
          {hero.level} ({hero.xp} XP)
        </strong>
      </div>
      <div className="stat-row">
        <span>Vitality</span>
        <strong>
          {hero.hp}/{hero.maxHp}
        </strong>
      </div>
      <p className="muted">Gear: {hero.equipment.join(', ') || 'Traveling light'}</p>
      <p className="muted">Perks: {hero.perks.join(', ') || 'None yet'}</p>

      <h3 style={{ marginTop: '1rem', color: 'var(--gold)', fontSize: '0.95rem' }}>Learn Perk</h3>
      <div className="list-actions">
        {HERO_PERKS.map((perk) => (
          <button
            key={perk.id}
            type="button"
            disabled={!isMyTurn || hero.perks.includes(perk.id) || hero.level < perk.requiresLevel}
            onClick={() => onPerk(perk.id)}
          >
            {perk.name} — {perk.description} (lv {perk.requiresLevel})
          </button>
        ))}
      </div>
    </div>
  )
}

function QuestPanel({
  state,
  humanId,
  isMyTurn,
  onAccept,
}: {
  state: GameState
  humanId: number
  isMyTurn: boolean
  onAccept: (id: string) => void
}) {
  return (
    <div>
      <h2 style={{ color: 'var(--gold)', fontSize: '1rem' }}>Quest Deck</h2>
      <p className="muted">Accept a quest, then move a squad onto its hex to complete it.</p>
      <div className="list-actions">
        {state.quests.map((q) => (
          <button
            key={q.id}
            type="button"
            disabled={
              !isMyTurn || q.completed || (q.acceptedBy !== null && q.acceptedBy !== humanId)
            }
            onClick={() => onAccept(q.id)}
          >
            <strong>{q.title}</strong>
            <div className="muted">
              {q.description} · Diff {q.difficulty} · ({q.locationQ},{q.locationR})
              {q.completed ? ' · Done' : q.acceptedBy === humanId ? ' · Active' : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function TechPanel({
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
  const cats = ['military', 'magic', 'civilization'] as const

  return (
    <div>
      <h2 style={{ color: 'var(--gold)', fontSize: '1rem' }}>Technology Tree</h2>
      <p className="muted">Research points: {player.researchPoints}</p>
      {cats.map((cat) => (
        <div key={cat} style={{ marginTop: '0.75rem' }}>
          <h3 style={{ textTransform: 'capitalize', color: 'var(--copper-bright)', fontSize: '0.9rem' }}>
            {cat}
          </h3>
          <div className="list-actions">
            {TECH_TREE.filter((t) => t.category === cat).map((t) => {
              const done = player.researched.includes(t.id)
              const locked = !t.requires.every((r) => player.researched.includes(r))
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={!isMyTurn || done || locked || player.researchPoints < t.cost}
                  onClick={() => onResearch(t.id)}
                >
                  {t.name} ({t.cost}) — {t.description}
                  {done ? ' ✓' : ''}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function CraftPanel({
  state,
  humanId,
  isMyTurn,
  onCraft,
}: {
  state: GameState
  humanId: number
  isMyTurn: boolean
  onCraft: (id: string) => void
}) {
  const player = state.players.find((p) => p.id === humanId)!
  return (
    <div>
      <h2 style={{ color: 'var(--gold)', fontSize: '1rem' }}>Crafting</h2>
      <div className="list-actions">
        {CRAFT_RECIPES.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={!isMyTurn || (player.crafted.includes(r.id) && r.category !== 'potion')}
            onClick={() => onCraft(r.id)}
          >
            [{r.category}] {r.name} — {r.effect}
          </button>
        ))}
      </div>
    </div>
  )
}

function DiplomacyPanel({
  state,
  humanId,
  isMyTurn,
  onSet,
}: {
  state: GameState
  humanId: number
  isMyTurn: boolean
  onSet: (id: number, status: 'war' | 'peace' | 'alliance') => void
}) {
  const others = state.players.filter((p) => p.id !== humanId)
  const statusOf = (id: number) => {
    const link = state.diplomacy.find(
      (d) => (d.a === humanId && d.b === id) || (d.a === id && d.b === humanId),
    )
    return link?.status ?? 'peace'
  }

  return (
    <div>
      <h2 style={{ color: 'var(--gold)', fontSize: '1rem' }}>Diplomacy</h2>
      <p className="muted">Trust is never guaranteed. Alliances grant Influence.</p>
      {others.map((p) => {
        const f = FACTIONS.find((x) => x.id === p.factionId)!
        return (
          <div key={p.id} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.75rem' }}>
            <strong style={{ color: f.accent }}>{p.name}</strong>
            <div className="muted">
              {f.name} · {statusOf(p.id)}
            </div>
            <div className="chip-row" style={{ marginTop: '0.5rem' }}>
              <button type="button" className="chip" disabled={!isMyTurn} onClick={() => onSet(p.id, 'alliance')}>
                Alliance
              </button>
              <button type="button" className="chip" disabled={!isMyTurn} onClick={() => onSet(p.id, 'peace')}>
                Peace
              </button>
              <button type="button" className="chip" disabled={!isMyTurn} onClick={() => onSet(p.id, 'war')}>
                War
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
