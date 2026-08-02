import {
  BOSS_TEMPLATES,
  BUILDINGS,
  CITY_NAMES,
  CRAFT_RECIPES,
  EMPTY_RESOURCES,
  FACTIONS,
  HERO_CLASSES,
  HERO_PERKS,
  QUEST_TEMPLATES,
  STARTING_RESOURCES,
  TECH_TREE,
  TERRAIN_META,
  UNIT_ROLES,
} from './data'
import { axialDistance, findTile, hexNeighbors, tilesInRadius } from './hex'
import {
  createLoreState,
  unlockBossLore,
  unlockCityLore,
  unlockQuestLore,
  unlockRandomWorldLore,
  unlockTechLore,
  unlockTerrainLore,
} from './lore'
import { createRng, type Rng } from './rng'
import type {
  Boss,
  BuildingType,
  City,
  CombatState,
  FactionId,
  GameState,
  HeroClass,
  HexTile,
  Player,
  Quest,
  ResourceType,
  SetupConfig,
  Squad,
  TerrainType,
  Unit,
  UnitRole,
  VictoryPath,
} from './types'

const TERRAINS: TerrainType[] = [
  'forest', 'desert', 'mountains', 'snow', 'plains',
  'river', 'swamp', 'ruins', 'cave', 'dungeon',
]

const RESOURCE_POOL: ResourceType[] = [
  'food', 'wood', 'stone', 'iron', 'gold', 'mana', 'oil', 'dragonScales',
]

function uid(prefix: string, rng: Rng): string {
  return `${prefix}_${rng.int(1e9).toString(36)}`
}

function generateMap(radius: number, rng: Rng): HexTile[] {
  return tilesInRadius(radius).map(([q, r]) => {
    const terrain = rng.pick(TERRAINS)
    const hasResource = rng.next() < 0.45
    return {
      q,
      r,
      terrain,
      ownerId: null,
      resource: hasResource ? rng.pick(RESOURCE_POOL) : null,
      exploredBy: [],
    }
  })
}

function spawnPoints(radius: number, count: number, rng: Rng): [number, number][] {
  const ring = Math.max(2, radius - 1)
  const candidates = tilesInRadius(radius).filter(
    ([q, r]) => axialDistance(0, 0, q, r) >= ring - 1,
  )
  const picks: [number, number][] = []
  const shuffled = rng.shuffle(candidates)
  for (const c of shuffled) {
    if (picks.every((p) => axialDistance(p[0], p[1], c[0], c[1]) >= 3)) {
      picks.push(c)
      if (picks.length >= count) break
    }
  }
  while (picks.length < count) {
    picks.push(rng.pick(candidates))
  }
  return picks
}

function makeUnit(role: UnitRole, rng: Rng): Unit {
  const def = UNIT_ROLES[role]
  return {
    id: uid('u', rng),
    role,
    hp: def.hp,
    maxHp: def.hp,
    attack: def.attack,
    defense: def.defense,
    range: def.range,
    suppressed: false,
    inCover: rng.next() > 0.5,
    highGround: false,
  }
}

function makeStarterSquad(ownerId: number, q: number, r: number, factionId: FactionId, rng: Rng): Squad {
  const faction = FACTIONS.find((f) => f.id === factionId)!
  const roles: UnitRole[] = ['infantry', 'shieldBearer', 'medic', 'sniper']
  if (faction.bonuses.summon) roles[3] = 'mage'
  return {
    id: uid('sq', rng),
    name: `${faction.name.split(' ').pop()} Squad`,
    q,
    r,
    units: roles.map((role) => makeUnit(role, rng)),
    movesLeft: 2 + faction.bonuses.movement,
    ownerId,
  }
}

function makeCity(ownerId: number, q: number, r: number, name: string, rng: Rng, isCapital = true): City {
  return {
    id: uid('city', rng),
    name,
    q,
    r,
    level: 1,
    buildings: ['farm'],
    isCapital: isCapital ? ownerId : -1,
    ownerId,
    hp: 40,
    maxHp: 40,
  }
}

function aiNames(factionId: FactionId): string {
  const map: Record<FactionId, string> = {
    ironLegion: 'Consul Varro',
    stormclans: 'Jarl Freya',
    arcaneDominion: 'Archmage Lys',
    wildHunt: 'Huntmaster Kael',
    ashborn: 'Slayer Nyra',
  }
  return map[factionId]
}

export function createGame(config: SetupConfig): GameState {
  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0
  const rng = createRng(seed)
  const radius = config.playerCount <= 3 ? 5 : 6
  const map = generateMap(radius, rng)
  const starts = spawnPoints(radius, config.playerCount, rng)
  const factionPool = rng.shuffle([...FACTIONS.map((f) => f.id)])
  const used = new Set<FactionId>([config.factionId])
  const cityNames = rng.shuffle([...CITY_NAMES])

  const players: Player[] = []
  const cities: Record<string, City> = {}
  const squads: Record<string, Squad> = {}

  for (let i = 0; i < config.playerCount; i++) {
    const isHuman = i === 0
    let factionId = config.factionId
    if (!isHuman) {
      factionId = factionPool.find((f) => !used.has(f)) ?? rng.pick(FACTIONS).id
      used.add(factionId)
    }
    const [q, r] = starts[i]!
    const heroClass: HeroClass = isHuman ? config.heroClass : rng.pick(HERO_CLASSES).id
    const heroDef = HERO_CLASSES.find((h) => h.id === heroClass)!
    const player: Player = {
      id: i,
      name: isHuman ? config.humanName || 'Commander' : aiNames(factionId),
      factionId,
      isHuman,
      resources: STARTING_RESOURCES(),
      hero: {
        name: isHuman ? config.heroName || 'Hero' : aiNames(factionId),
        class: heroClass,
        level: 1,
        xp: 0,
        perks: [],
        equipment: [],
        hp: heroDef.hp,
        maxHp: heroDef.hp,
      },
      cities: [],
      squads: [],
      researched: [],
      researchPoints: 0,
      influence: 0,
      relics: 0,
      legendaryQuests: 0,
      bossesDefeated: 0,
      crafted: [],
      victoryPath: isHuman ? config.victoryPath : (rng.pick(['domination', 'knowledge', 'legend', 'influence'] as VictoryPath[])),
    }

    const city = makeCity(i, q, r, cityNames[i] ?? `City ${i + 1}`, rng, true)
    cities[city.id] = city
    player.cities.push(city.id)

    const squad = makeStarterSquad(i, q, r, factionId, rng)
    squads[squad.id] = squad
    player.squads.push(squad.id)

    const tile = findTile(map, q, r)!
    tile.ownerId = i
    tile.exploredBy = [i]
    for (const [nq, nr] of hexNeighbors(q, r)) {
      const n = findTile(map, nq, nr)
      if (n && !n.exploredBy.includes(i)) n.exploredBy.push(i)
    }

    players.push(player)
  }

  // Quests
  const questTiles = rng.shuffle(map.filter((t) => !players.some((p) => {
    const c = cities[p.cities[0]!]
    return c && c.q === t.q && c.r === t.r
  })))
  const quests: Quest[] = QUEST_TEMPLATES.map((tpl, idx) => {
    const tile = questTiles[idx % questTiles.length]!
    return {
      id: uid('quest', rng),
      title: tpl.title,
      description: tpl.description,
      difficulty: tpl.difficulty,
      rewards: { ...tpl.rewards },
      acceptedBy: null,
      completed: false,
      locationQ: tile.q,
      locationR: tile.r,
    }
  })

  // Bosses
  const bossTiles = rng.shuffle(map).slice(0, Math.min(4, BOSS_TEMPLATES.length))
  const bosses: Boss[] = bossTiles.map((tile, i) => {
    const tpl = BOSS_TEMPLATES[i]!
    return {
      id: uid('boss', rng),
      name: tpl.name,
      q: tile.q,
      r: tile.r,
      hp: tpl.hp,
      maxHp: tpl.hp,
      attack: tpl.attack,
      defeated: false,
      loot: tpl.loot,
    }
  })

  const humanFaction = players[0]!.factionId
  let loreState: GameState = {
    phase: 'playing',
    seed,
    turn: 1,
    activePlayerId: 0,
    players,
    map,
    mapRadius: radius,
    cities,
    squads,
    quests,
    bosses,
    diplomacy: [],
    combat: null,
    lore: createLoreState(humanFaction, 1, 0),
    eventLog: [
      'The continent of Asterra awakens. Dragons return. Choose your path to legend.',
      'LORE Engine online — Legends, Origins, Records, and Echoes await discovery.',
      `${players[0]!.name} of ${FACTIONS.find((f) => f.id === players[0]!.factionId)!.name} claims the field.`,
    ],
    winnerId: null,
    winReason: null,
  }

  const capital = Object.values(cities).find((c) => c.ownerId === 0)
  if (capital) {
    const capitalTile = findTile(map, capital.q, capital.r)
    if (capitalTile) loreState = unlockTerrainLore(loreState, capitalTile.terrain, 0)
    loreState = unlockCityLore(loreState, capital.name, 0)
  }

  return loreState
}

function pushLog(state: GameState, msg: string): GameState {
  return { ...state, eventLog: [msg, ...state.eventLog].slice(0, 40) }
}

function updatePlayer(state: GameState, playerId: number, fn: (p: Player) => Player): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? fn(p) : p)),
  }
}

function canAfford(res: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>): boolean {
  return (Object.entries(cost) as [ResourceType, number][]).every(([k, v]) => (res[k] ?? 0) >= (v ?? 0))
}

function pay(res: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>): Record<ResourceType, number> {
  const next = { ...res }
  for (const [k, v] of Object.entries(cost) as [ResourceType, number][]) {
    next[k] = (next[k] ?? 0) - (v ?? 0)
  }
  return next
}

function addResources(res: Record<ResourceType, number>, gain: Partial<Record<ResourceType, number>>): Record<ResourceType, number> {
  const next = { ...res }
  for (const [k, v] of Object.entries(gain) as [ResourceType, number][]) {
    next[k] = (next[k] ?? 0) + (v ?? 0)
  }
  return next
}

function factionOf(player: Player) {
  return FACTIONS.find((f) => f.id === player.factionId)!
}

export function collectIncome(state: GameState, playerId: number): GameState {
  const player = state.players.find((p) => p.id === playerId)!
  const faction = factionOf(player)
  let gain = EMPTY_RESOURCES()
  let research = 1 + faction.bonuses.research

  for (const cityId of player.cities) {
    const city = state.cities[cityId]
    if (!city) continue
    gain.food += 1 + city.level
    gain.gold += 1
    for (const b of city.buildings) {
      if (b === 'farm') gain.food += 2 + (player.researched.includes('betterFarming') ? 1 : 0)
      if (b === 'mine') {
        gain.stone += 1
        gain.iron += 1
      }
      if (b === 'mageTower') gain.mana += 2
      if (b === 'market') gain.gold += 2 + (player.researched.includes('banking') ? 2 : 0)
      if (b === 'university') research += 2
      if (b === 'blacksmith') gain.iron += 1
    }
    const tile = findTile(state.map, city.q, city.r)
    if (tile) {
      const yields = TERRAIN_META[tile.terrain].yields
      gain = addResources(gain, yields)
      if (tile.resource) gain[tile.resource] += 1
    }
  }

  // Controlled tiles
  for (const tile of state.map) {
    if (tile.ownerId === playerId && tile.resource) {
      gain[tile.resource] += 1
    }
  }

  return updatePlayer(state, playerId, (p) => ({
    ...p,
    resources: addResources(p.resources, gain),
    researchPoints: p.researchPoints + research,
  }))
}

export function endTurn(state: GameState): GameState {
  if (state.phase !== 'playing') return state
  let next = state
  const current = next.players.find((p) => p.id === next.activePlayerId)!

  // LORE Engine: periodic world revelations for the human chronicler
  if (current.isHuman && current.id === 0 && state.turn % 3 === 0) {
    next = unlockRandomWorldLore(next, current.id)
  }

  // Reset moves for current player's squads
  const squads = { ...next.squads }
  for (const sid of current.squads) {
    const s = squads[sid]
    if (s) {
      const faction = factionOf(current)
      squads[sid] = { ...s, movesLeft: 2 + faction.bonuses.movement }
    }
  }
  next = { ...next, squads }

  let nextId = (next.activePlayerId + 1) % next.players.length
  let turn = next.turn
  if (nextId === 0) {
    turn += 1
    next = wanderBosses({ ...next, turn })
  }

  next = { ...next, activePlayerId: nextId }
  next = collectIncome(next, nextId)
  next = checkVictory(next)

  const np = next.players.find((p) => p.id === nextId)!
  next = pushLog(next, `Turn ${next.turn}: ${np.name}'s campaign begins.`)

  // Auto-play AI until human or victory
  if (!np.isHuman && next.phase === 'playing') {
    next = runAiTurn(next)
  }

  return next
}

function wanderBosses(state: GameState): GameState {
  const rng = createRng(state.seed + state.turn * 97)
  const bosses = state.bosses.map((b) => {
    if (b.defeated) return b
    const neighbors = hexNeighbors(b.q, b.r).filter(([q, r]) => findTile(state.map, q, r))
    if (!neighbors.length) return b
    const [q, r] = rng.pick(neighbors)
    return { ...b, q, r }
  })
  return { ...state, bosses }
}

export function claimTile(state: GameState, q: number, r: number): GameState {
  const player = state.players.find((p) => p.id === state.activePlayerId)!
  if (!player.isHuman && state.players[0] && state.activePlayerId !== 0) {
    // allow AI path
  }
  const tile = findTile(state.map, q, r)
  if (!tile || tile.ownerId !== null) return state

  const nearSquad = player.squads.some((sid) => {
    const s = state.squads[sid]
    return s && axialDistance(s.q, s.r, q, r) <= 1
  })
  if (!nearSquad) return pushLog(state, 'A squad must be adjacent to claim territory.')

  const map = state.map.map((t) =>
    t.q === q && t.r === r
      ? { ...t, ownerId: player.id, exploredBy: t.exploredBy.includes(player.id) ? t.exploredBy : [...t.exploredBy, player.id] }
      : t,
  )
  let next = { ...state, map }
  if (tile.resource) {
    next = updatePlayer(next, player.id, (p) => ({
      ...p,
      resources: addResources(p.resources, { [tile.resource!]: 1 }),
    }))
  }
  if (player.isHuman) next = unlockTerrainLore(next, tile.terrain, player.id)
  return pushLog(next, `${player.name} claims the ${TERRAIN_META[tile.terrain].label}.`)
}

export function moveSquad(state: GameState, squadId: string, q: number, r: number): GameState {
  const squad = state.squads[squadId]
  if (!squad || squad.ownerId !== state.activePlayerId) return state
  if (squad.movesLeft <= 0) return pushLog(state, 'This squad has no moves left.')
  const tile = findTile(state.map, q, r)
  if (!tile) return state
  const dist = axialDistance(squad.q, squad.r, q, r)
  if (dist !== 1) return pushLog(state, 'Squads move one hex at a time.')

  const player = state.players.find((p) => p.id === squad.ownerId)!
  const cost = player.researched.includes('airships') ? 1 : TERRAIN_META[tile.terrain].moveCost
  if (squad.movesLeft < cost && cost > 1) {
    // still allow move but consume all
  }

  // Explore
  const newlyExplored: typeof state.map = []
  const map = state.map.map((t) => {
    if (axialDistance(t.q, t.r, q, r) <= 1 + factionOf(player).bonuses.exploration) {
      if (!t.exploredBy.includes(player.id)) {
        const explored = { ...t, exploredBy: [...t.exploredBy, player.id] }
        newlyExplored.push(explored)
        return explored
      }
    }
    return t
  })

  const moved: Squad = {
    ...squad,
    q,
    r,
    movesLeft: Math.max(0, squad.movesLeft - Math.min(cost, squad.movesLeft)),
  }
  let next: GameState = {
    ...state,
    map,
    squads: { ...state.squads, [squadId]: moved },
  }

  // LORE: first contact with terrain types
  if (player.isHuman) {
    for (const t of newlyExplored) {
      next = unlockTerrainLore(next, t.terrain, player.id)
    }
    if (!tile.exploredBy.includes(player.id)) {
      next = unlockTerrainLore(next, tile.terrain, player.id)
    }
  }

  // Raid
  const faction = factionOf(player)
  if (faction.bonuses.raid && tile.ownerId !== null && tile.ownerId !== player.id) {
    next = updatePlayer(next, player.id, (p) => ({
      ...p,
      resources: addResources(p.resources, { gold: 1, food: 1 }),
    }))
    next = pushLog(next, `${player.name} raids enemy lands for spoils!`)
  }

  // Encounter enemy squad
  const enemySquad = Object.values(next.squads).find(
    (s) => s.ownerId !== player.id && s.q === q && s.r === r && s.units.some((u) => u.hp > 0),
  )
  if (enemySquad) {
    return startCombat(next, squadId, enemySquad.id, null)
  }

  // Encounter boss
  const boss = next.bosses.find((b) => !b.defeated && b.q === q && b.r === r)
  if (boss) {
    return startCombat(next, squadId, null, boss.id)
  }

  // Quest location
  const quest = next.quests.find(
    (qq) => !qq.completed && qq.acceptedBy === player.id && qq.locationQ === q && qq.locationR === r,
  )
  if (quest) {
    next = completeQuest(next, quest.id)
  }

  return next
}

export function buildInCity(state: GameState, cityId: string, building: BuildingType): GameState {
  const city = state.cities[cityId]
  if (!city || city.ownerId !== state.activePlayerId) return state
  if (city.buildings.includes(building)) return pushLog(state, 'Building already present.')
  const def = BUILDINGS[building]
  if (city.level < def.unlockLevel) return pushLog(state, `City must reach level ${def.unlockLevel}.`)

  const player = state.players.find((p) => p.id === city.ownerId)!
  const faction = factionOf(player)
  const cost = { ...def.cost }
  if (faction.bonuses.cityCost < 0 && cost.stone) cost.stone = Math.max(0, cost.stone + faction.bonuses.cityCost)
  if (player.researched.includes('engineering') && cost.stone) cost.stone = Math.max(0, cost.stone - 1)
  if (!canAfford(player.resources, cost)) return pushLog(state, 'Not enough resources.')

  let next = updatePlayer(state, player.id, (p) => ({ ...p, resources: pay(p.resources, cost) }))
  const buildings = [...city.buildings, building]
  let level = city.level
  if (buildings.length >= level * 2) level += 1
  next = {
    ...next,
    cities: {
      ...next.cities,
      [cityId]: { ...city, buildings, level, maxHp: 40 + level * 10, hp: 40 + level * 10 },
    },
  }
  return pushLog(next, `${city.name} constructs a ${def.name}.`)
}

export function foundCity(state: GameState, squadId: string): GameState {
  const squad = state.squads[squadId]
  if (!squad || squad.ownerId !== state.activePlayerId) return state
  const player = state.players.find((p) => p.id === squad.ownerId)!
  const occupied = Object.values(state.cities).some((c) => c.q === squad.q && c.r === squad.r)
  if (occupied) return pushLog(state, 'A city already stands here.')

  const cost = { food: 5, wood: 4, stone: 3 + factionOf(player).bonuses.cityCost }
  if (!canAfford(player.resources, cost)) return pushLog(state, 'Need more resources to found a city.')

  const rng = createRng(state.seed + state.turn + player.id * 13)
  const name = rng.pick(CITY_NAMES.filter((n) => !Object.values(state.cities).some((c) => c.name === n))) || `Outpost ${player.cities.length + 1}`
  const city = makeCity(player.id, squad.q, squad.r, name, rng, false)
  let next = updatePlayer(state, player.id, (p) => ({
    ...p,
    resources: pay(p.resources, cost),
    cities: [...p.cities, city.id],
    influence: p.influence + 2,
  }))
  next = {
    ...next,
    cities: { ...next.cities, [city.id]: city },
    map: next.map.map((t) =>
      t.q === squad.q && t.r === squad.r ? { ...t, ownerId: player.id } : t,
    ),
  }
  if (player.isHuman) next = unlockCityLore(next, city.name, player.id)
  return pushLog(next, `${player.name} founds ${city.name}.`)
}

export function recruitUnit(state: GameState, squadId: string, role: UnitRole): GameState {
  const squad = state.squads[squadId]
  if (!squad || squad.ownerId !== state.activePlayerId) return state
  if (squad.units.filter((u) => u.hp > 0).length >= 4) return pushLog(state, 'Squads hold 4 units max.')

  const player = state.players.find((p) => p.id === squad.ownerId)!
  const def = UNIT_ROLES[role]
  const cost = { ...def.cost }
  if (player.factionId === 'ironLegion') {
    for (const k of Object.keys(cost) as ResourceType[]) {
      if (cost[k]) cost[k] = Math.max(1, (cost[k] ?? 0) - 1)
    }
  }
  if (!canAfford(player.resources, cost)) return pushLog(state, 'Cannot afford this unit.')

  const rng = createRng(state.seed + Object.keys(state.squads).length)
  const unit = makeUnit(role, rng)
  let next = updatePlayer(state, player.id, (p) => ({ ...p, resources: pay(p.resources, cost) }))
  next = {
    ...next,
    squads: {
      ...next.squads,
      [squadId]: { ...squad, units: [...squad.units.filter((u) => u.hp > 0), unit].slice(0, 4) },
    },
  }
  return pushLog(next, `Recruited ${def.name} into ${squad.name}.`)
}

export function researchTech(state: GameState, techId: string): GameState {
  const player = state.players.find((p) => p.id === state.activePlayerId)!
  const tech = TECH_TREE.find((t) => t.id === techId)
  if (!tech) return state
  if (player.researched.includes(techId)) return pushLog(state, 'Already researched.')
  if (!tech.requires.every((r) => player.researched.includes(r))) {
    return pushLog(state, 'Missing prerequisite technology.')
  }
  if (player.researchPoints < tech.cost) return pushLog(state, 'Not enough research points.')

  let next = updatePlayer(state, player.id, (p) => {
    const researched = [...p.researched, techId]
    let influence = p.influence
    if (techId === 'democracy') influence += 8
    return {
      ...p,
      researched,
      researchPoints: p.researchPoints - tech.cost,
      influence,
    }
  })
  next = pushLog(next, `${player.name} unlocks ${tech.name}.`)
  if (player.isHuman) next = unlockTechLore(next, tech.name, player.id)
  if (techId === 'skyForge' && player.isHuman) next = unlockRandomWorldLore(next, player.id)
  return checkVictory(next)
}

export function acceptQuest(state: GameState, questId: string): GameState {
  const quest = state.quests.find((q) => q.id === questId)
  if (!quest || quest.completed || quest.acceptedBy !== null) return state
  const player = state.players.find((p) => p.id === state.activePlayerId)!
  const quests = state.quests.map((q) =>
    q.id === questId ? { ...q, acceptedBy: player.id } : q,
  )
  return pushLog({ ...state, quests }, `${player.name} accepts: ${quest.title}.`)
}

function completeQuest(state: GameState, questId: string): GameState {
  const quest = state.quests.find((q) => q.id === questId)
  if (!quest || quest.completed || quest.acceptedBy === null) return state
  const playerId = quest.acceptedBy
  let next = updatePlayer(state, playerId, (p) => {
    const rewards = quest.rewards
    const resGain: Partial<Record<ResourceType, number>> = {}
    for (const key of Object.keys(EMPTY_RESOURCES()) as ResourceType[]) {
      if (typeof rewards[key] === 'number') resGain[key] = rewards[key] as number
    }
    const equipment = rewards.legendary
      ? [...p.hero.equipment, rewards.legendary]
      : p.hero.equipment
    let xp = p.hero.xp + (rewards.xp ?? 0)
    let level = p.hero.level
    while (xp >= level * 40) {
      xp -= level * 40
      level += 1
    }
    return {
      ...p,
      resources: addResources(p.resources, resGain),
      influence: p.influence + (rewards.influence ?? 0),
      relics: p.relics + (rewards.relic ? 1 : 0),
      legendaryQuests: p.legendaryQuests + (quest.difficulty >= 3 ? 1 : 0),
      hero: { ...p.hero, xp, level, equipment },
    }
  })
  const quests = next.quests.map((q) =>
    q.id === questId ? { ...q, completed: true } : q,
  )
  next = { ...next, quests }
  next = pushLog(next, `Quest complete: ${quest.title}!`)
  const completer = next.players.find((p) => p.id === playerId)
  if (completer?.isHuman) next = unlockQuestLore(next, quest.title, playerId)
  return checkVictory(next)
}

export function craftItem(state: GameState, recipeId: string): GameState {
  const recipe = CRAFT_RECIPES.find((r) => r.id === recipeId)
  if (!recipe) return state
  const player = state.players.find((p) => p.id === state.activePlayerId)!
  let cost = { ...recipe.cost }
  if (player.hero.perks.includes('smithing') || player.factionId === 'ashborn') {
    for (const k of Object.keys(cost) as ResourceType[]) {
      if (cost[k]) cost[k] = Math.max(1, Math.floor((cost[k] ?? 0) * 0.75))
    }
  }
  if (!canAfford(player.resources, cost)) return pushLog(state, 'Missing craft materials.')
  if (player.crafted.includes(recipeId) && recipe.category !== 'potion') {
    return pushLog(state, 'Already crafted this item.')
  }

  let next = updatePlayer(state, player.id, (p) => {
    const crafted = p.crafted.includes(recipeId) ? p.crafted : [...p.crafted, recipeId]
    let hero = {
      ...p.hero,
      equipment: p.hero.equipment.includes(recipe.name)
        ? p.hero.equipment
        : [...p.hero.equipment, recipe.name],
    }
    if (recipeId === 'healingPotion') {
      hero = { ...hero, hp: Math.min(hero.maxHp, hero.hp + 25) }
    }
    return { ...p, resources: pay(p.resources, cost), crafted, hero }
  })
  return pushLog(next, `Crafted ${recipe.name}. ${recipe.effect}`)
}

export function learnPerk(state: GameState, perkId: string): GameState {
  const perk = HERO_PERKS.find((p) => p.id === perkId)
  if (!perk) return state
  const player = state.players.find((p) => p.id === state.activePlayerId)!
  if (player.hero.level < perk.requiresLevel) return pushLog(state, `Requires hero level ${perk.requiresLevel}.`)
  if (player.hero.perks.includes(perkId)) return state
  return updatePlayer(
    pushLog(state, `${player.hero.name} learns ${perk.name}.`),
    player.id,
    (p) => ({ ...p, hero: { ...p.hero, perks: [...p.hero.perks, perkId] } }),
  )
}

export function setDiplomacy(
  state: GameState,
  otherId: number,
  status: 'war' | 'peace' | 'alliance',
): GameState {
  const me = state.activePlayerId
  if (otherId === me) return state
  let diplomacy = state.diplomacy.filter(
    (d) => !((d.a === me && d.b === otherId) || (d.a === otherId && d.b === me)),
  )
  diplomacy = [...diplomacy, { a: me, b: otherId, status }]
  let next: GameState = { ...state, diplomacy }
  if (status === 'alliance') {
    next = updatePlayer(next, me, (p) => ({
      ...p,
      influence: p.influence + (p.hero.perks.includes('speech') ? 8 : 5),
    }))
  }
  const other = state.players.find((p) => p.id === otherId)!
  const label = status === 'war' ? 'declares war on' : status === 'alliance' ? 'forms an alliance with' : 'offers peace to'
  next = pushLog(next, `${state.players[me]!.name} ${label} ${other.name}.`)
  return checkVictory(next)
}

function startCombat(
  state: GameState,
  attackerSquadId: string,
  defenderSquadId: string | null,
  bossId: string | null,
): GameState {
  const attacker = state.squads[attackerSquadId]!
  const combat: CombatState = {
    attackerId: attacker.ownerId,
    defenderId: defenderSquadId
      ? state.squads[defenderSquadId]!.ownerId
      : -1,
    attackerSquadId,
    defenderSquadId,
    bossId,
    log: ['Battle is joined! Positioning decides the day.'],
    turn: 'attacker',
    round: 1,
  }
  return { ...state, phase: 'combat', combat }
}

function combatPower(units: Unit[], player: Player | undefined, vsBoss: boolean): number {
  let power = 0
  for (const u of units.filter((x) => x.hp > 0)) {
    let atk = u.attack
    if (u.inCover) atk += 1
    if (u.highGround) atk += 2
    if (u.suppressed) atk -= 3
    power += Math.max(1, atk)
  }
  if (player) {
    const f = factionOf(player)
    power += f.bonuses.melee
    power += f.bonuses.defense
    if (vsBoss) power += f.bonuses.bossBonus
    if (player.hero.perks.includes('dualWield')) power += 2
    if (player.hero.perks.includes('dragonSlayer') && vsBoss) power += 4
    if (player.hero.perks.includes('heavyArmor')) power += 2
    if (player.researched.includes('crossbows')) power += 1
    if (player.researched.includes('rifles')) power += 2
    power += Math.floor(player.hero.level / 2)
  }
  return power
}

export function combatAction(state: GameState, action: 'strike' | 'cover' | 'flank' | 'heal' | 'flee'): GameState {
  if (state.phase !== 'combat' || !state.combat) return state
  const combat = { ...state.combat, log: [...state.combat.log] }
  const rng = createRng(state.seed + state.turn * 31 + combat.round * 17 + combat.log.length)

  const atkSquad = state.squads[combat.attackerSquadId]!
  const atkPlayer = state.players.find((p) => p.id === combat.attackerId)!

  if (action === 'flee') {
    return pushLog(
      { ...state, phase: 'playing', combat: null },
      `${atkPlayer.name} withdraws from battle.`,
    )
  }

  let defUnits: Unit[] = []
  let defPlayer: Player | undefined
  let boss = combat.bossId ? state.bosses.find((b) => b.id === combat.bossId) : null

  if (combat.defenderSquadId) {
    const ds = state.squads[combat.defenderSquadId]!
    defUnits = ds.units
    defPlayer = state.players.find((p) => p.id === ds.ownerId)
  }

  if (action === 'cover') {
    const units = atkSquad.units.map((u) => ({ ...u, inCover: true, suppressed: false }))
    combat.log.push('Squad takes cover — defense up.')
    const squads = { ...state.squads, [atkSquad.id]: { ...atkSquad, units } }
    return resolveCombatRound({ ...state, squads, combat }, rng)
  }

  if (action === 'heal') {
    const units = atkSquad.units.map((u) => {
      if (u.role === 'medic' || u.role === 'infantry') {
        const bonus = atkPlayer.researched.includes('healing') ? 10 : 0
        return { ...u, hp: Math.min(u.maxHp, u.hp + 8 + bonus) }
      }
      return u
    })
    combat.log.push('Medics tend the wounded.')
    const squads = { ...state.squads, [atkSquad.id]: { ...atkSquad, units } }
    return resolveCombatRound({ ...state, squads, combat }, rng)
  }

  // strike / flank
  let atkUnits = atkSquad.units.map((u) => ({
    ...u,
    highGround: action === 'flank' ? true : u.highGround,
  }))
  if (action === 'flank') combat.log.push('Flanking maneuver! High ground seized.')

  let power = combatPower(atkUnits, atkPlayer, !!boss)
  if (action === 'flank') power += 4
  if (atkPlayer.hero.perks.includes('sneakAttack') && combat.round === 1) power += 5
  if (atkPlayer.hero.perks.includes('fireball')) power += 3

  const variance = rng.int(6) - 2
  power = Math.max(1, power + variance)

  if (boss && !boss.defeated) {
    const dmg = Math.max(5, power - 4)
    const newHp = boss.hp - dmg
    combat.log.push(`Heroic assault deals ${dmg} to ${boss.name}!`)
    const bosses = state.bosses.map((b) =>
      b.id === boss!.id ? { ...b, hp: Math.max(0, newHp) } : b,
    )
    // Boss counter
    const counter = Math.max(3, boss.attack - factionOf(atkPlayer).bonuses.defense + rng.int(4))
    atkUnits = applyDamage(atkUnits, counter)
    combat.log.push(`${boss.name} retaliates for ${counter}!`)

    let next: GameState = {
      ...state,
      bosses,
      squads: { ...state.squads, [atkSquad.id]: { ...atkSquad, units: atkUnits } },
      combat: { ...combat, round: combat.round + 1 },
    }

    if (newHp <= 0) {
      next = finishBossVictory(next, atkPlayer.id, boss.id)
      return next
    }
    if (atkUnits.every((u) => u.hp <= 0)) {
      return pushLog(
        { ...next, phase: 'playing', combat: null },
        `${atkPlayer.name}'s squad falls to ${boss.name}.`,
      )
    }
    return next
  }

  // PvP / AI squad
  const defPower = combatPower(defUnits, defPlayer, false)
  const dmgToDef = Math.max(4, power - Math.floor(defPower / 3))
  const dmgToAtk = Math.max(3, defPower - Math.floor(power / 3) + rng.int(3))
  defUnits = applyDamage(defUnits, dmgToDef)
  atkUnits = applyDamage(atkUnits, dmgToAtk)
  combat.log.push(`Exchange of fire — dealt ${dmgToDef}, took ${dmgToAtk}.`)

  // Suppression from heavy gunners
  if (atkUnits.some((u) => u.role === 'heavyGunner' && u.hp > 0)) {
    defUnits = defUnits.map((u) => ({ ...u, suppressed: true }))
    combat.log.push('Heavy gunner suppresses the enemy!')
  }

  let next: GameState = {
    ...state,
    squads: {
      ...state.squads,
      [atkSquad.id]: { ...atkSquad, units: atkUnits },
      ...(combat.defenderSquadId
        ? { [combat.defenderSquadId]: { ...state.squads[combat.defenderSquadId]!, units: defUnits } }
        : {}),
    },
    combat: { ...combat, round: combat.round + 1, turn: combat.turn === 'attacker' ? 'defender' : 'attacker' },
  }

  if (defUnits.every((u) => u.hp <= 0)) {
    return finishSquadVictory(next, combat.attackerId, combat.defenderId)
  }
  if (atkUnits.every((u) => u.hp <= 0)) {
    return finishSquadVictory(next, combat.defenderId, combat.attackerId)
  }

  return next
}

function applyDamage(units: Unit[], total: number): Unit[] {
  let remaining = total
  return units.map((u) => {
    if (u.hp <= 0 || remaining <= 0) return u
    const mitigation = u.defense + (u.inCover ? 2 : 0)
    const take = Math.min(u.hp, Math.max(1, Math.ceil(remaining * 0.35) - Math.floor(mitigation / 3)))
    remaining -= take
    return { ...u, hp: u.hp - take }
  })
}

function resolveCombatRound(state: GameState, rng: Rng): GameState {
  // Enemy auto-counter when player chose defensive action
  if (!state.combat) return state
  return combatAction(
    { ...state, combat: { ...state.combat, log: [...state.combat.log, 'Enemy presses the attack...'] } },
    rng.next() > 0.5 ? 'strike' : 'flank',
  )
}

function finishBossVictory(state: GameState, playerId: number, bossId: string): GameState {
  const boss = state.bosses.find((b) => b.id === bossId)!
  let next = updatePlayer(state, playerId, (p) => ({
    ...p,
    bossesDefeated: p.bossesDefeated + 1,
    relics: p.relics + 1,
    influence: p.influence + 6,
    resources: addResources(p.resources, { dragonScales: 1, gold: 5 }),
    hero: {
      ...p.hero,
      equipment: [...p.hero.equipment, boss.loot],
      xp: p.hero.xp + 50,
      level: p.hero.xp + 50 >= p.hero.level * 40 ? p.hero.level + 1 : p.hero.level,
    },
  }))
  next = {
    ...next,
    bosses: next.bosses.map((b) => (b.id === bossId ? { ...b, defeated: true, hp: 0 } : b)),
    phase: 'playing',
    combat: null,
  }
  next = pushLog(next, `${boss.name} is slain! Loot claimed: ${boss.loot}.`)
  const slayer = next.players.find((p) => p.id === playerId)
  if (slayer?.isHuman) next = unlockBossLore(next, boss.name, playerId)
  return checkVictory(next)
}

function finishSquadVictory(state: GameState, winnerId: number, loserId: number): GameState {
  let next: GameState = { ...state, phase: 'playing', combat: null }
  if (winnerId >= 0) {
    next = updatePlayer(next, winnerId, (p) => ({
      ...p,
      resources: addResources(p.resources, { gold: 2, iron: 1 }),
      influence: p.influence + 2,
      hero: { ...p.hero, xp: p.hero.xp + 15 },
    }))
    const winner = next.players.find((p) => p.id === winnerId)!
    next = pushLog(next, `${winner.name} wins the skirmish.`)
  }
  if (loserId >= 0) {
    // Capture nearby city if capital undefended logic - soft: steal gold
    next = updatePlayer(next, loserId, (p) => ({
      ...p,
      resources: pay(p.resources, { gold: Math.min(2, p.resources.gold) }),
    }))
  }

  // Capture capital check: if winner's squad on loser capital
  if (winnerId >= 0 && loserId >= 0) {
    const winnerSquads = Object.values(next.squads).filter((s) => s.ownerId === winnerId)
    for (const city of Object.values(next.cities)) {
      if (city.ownerId === loserId && city.isCapital === loserId) {
        const onCapital = winnerSquads.some((s) => s.q === city.q && s.r === city.r)
        if (onCapital) {
          next = {
            ...next,
            cities: {
              ...next.cities,
              [city.id]: { ...city, ownerId: winnerId, isCapital: -1 },
            },
          }
          next = updatePlayer(next, winnerId, (p) => ({
            ...p,
            cities: p.cities.includes(city.id) ? p.cities : [...p.cities, city.id],
          }))
          next = updatePlayer(next, loserId, (p) => ({
            ...p,
            cities: p.cities.filter((id) => id !== city.id),
          }))
          next = pushLog(next, `Capital ${city.name} has fallen!`)
        }
      }
    }
  }

  return checkVictory(next)
}

export function checkVictory(state: GameState): GameState {
  for (const p of state.players) {
    const path = p.victoryPath

    if (path === 'domination') {
      const capitals = Object.values(state.cities).filter((c) => c.isCapital >= 0)
      const owned = capitals.filter((c) => c.ownerId === p.id)
      // Also: own all original capitals
      const allCapitalsOwned =
        state.players.every((op) => {
          if (op.id === p.id) return true
          return !Object.values(state.cities).some((c) => c.isCapital === op.id && c.ownerId === op.id)
        }) && owned.length >= 1
      if (allCapitalsOwned && state.players.length > 1) {
        const enemiesAlive = state.players.filter((op) => op.id !== p.id).some((op) =>
          Object.values(state.cities).some((c) => c.isCapital === op.id && c.ownerId === op.id),
        )
        if (!enemiesAlive) {
          return {
            ...state,
            phase: 'victory',
            winnerId: p.id,
            winReason: `${p.name} achieves Domination — every capital flies their banner.`,
          }
        }
      }
    }

    if (path === 'knowledge') {
      const required = TECH_TREE.filter((t) => t.id !== 'skyForge').every((t) =>
        p.researched.includes(t.id),
      )
      if (required && p.researched.includes('skyForge')) {
        return {
          ...state,
          phase: 'victory',
          winnerId: p.id,
          winReason: `${p.name} completes the Sky Forge — Knowledge victory!`,
        }
      }
    }

    if (path === 'legend') {
      if (p.bossesDefeated >= 3 && p.legendaryQuests >= 5 && p.relics >= 6) {
        return {
          ...state,
          phase: 'victory',
          winnerId: p.id,
          winReason: `${p.name} forges a Legend — bosses, quests, and relics united.`,
        }
      }
    }

    if (path === 'influence') {
      // Wonders: sky forge counts; universities & markets contribute
      let inf = p.influence
      for (const cid of p.cities) {
        const city = state.cities[cid]
        if (!city) continue
        if (city.buildings.includes('university')) inf += 0 // already counted via actions
      }
      if (p.researched.includes('skyForge')) inf += 0
      if (inf >= 50) {
        return {
          ...state,
          phase: 'victory',
          winnerId: p.id,
          winReason: `${p.name} reaches 50 Influence — the realm bends to their will.`,
        }
      }
    }
  }

  // Soft domination: last player with a capital
  const withCapital = state.players.filter((p) =>
    Object.values(state.cities).some((c) => c.isCapital === p.id && c.ownerId === p.id),
  )
  if (withCapital.length === 1 && state.turn > 1) {
    const p = withCapital[0]!
    return {
      ...state,
      phase: 'victory',
      winnerId: p.id,
      winReason: `${p.name} is the last power standing.`,
    }
  }

  return state
}

function runAiTurn(state: GameState): GameState {
  let next = state
  let guard = 0
  while (
    next.phase === 'playing' &&
    !next.players.find((p) => p.id === next.activePlayerId)!.isHuman &&
    guard < 12
  ) {
    guard++
    next = aiAct(next)
    if (next.phase === 'combat' && next.combat) {
      // Resolve combat quickly
      let cguard = 0
      while (next.phase === 'combat' && cguard < 8) {
        next = combatAction(next, 'strike')
        cguard++
      }
    }
    if (next.phase === 'victory') break
    // End AI turn
    if (next.phase === 'playing') {
      next = endTurnWithoutAi(next)
    }
  }
  return next
}

function endTurnWithoutAi(state: GameState): GameState {
  if (state.phase !== 'playing') return state
  let next = state
  const current = next.players.find((p) => p.id === next.activePlayerId)!
  const squads = { ...next.squads }
  for (const sid of current.squads) {
    const s = squads[sid]
    if (s) {
      squads[sid] = { ...s, movesLeft: 2 + factionOf(current).bonuses.movement }
    }
  }
  next = { ...next, squads }
  let nextId = (next.activePlayerId + 1) % next.players.length
  let turn = next.turn
  if (nextId === 0) {
    turn += 1
    next = wanderBosses({ ...next, turn })
  }
  next = { ...next, activePlayerId: nextId, turn }
  next = collectIncome(next, nextId)
  next = checkVictory(next)
  const np = next.players.find((p) => p.id === nextId)!
  next = pushLog(next, `Turn ${next.turn}: ${np.name}'s campaign begins.`)
  if (!np.isHuman && next.phase === 'playing') {
    return runAiTurn(next)
  }
  return next
}

function aiAct(state: GameState): GameState {
  const rng = createRng(state.seed + state.turn * 41 + state.activePlayerId * 7)
  const player = state.players.find((p) => p.id === state.activePlayerId)!
  let next = state

  // Research if possible
  const available = TECH_TREE.filter(
    (t) =>
      !player.researched.includes(t.id) &&
      t.requires.every((r) => player.researched.includes(r)) &&
      player.researchPoints >= t.cost,
  )
  if (available.length) {
    next = researchTech(next, rng.pick(available).id)
  }

  // Build
  const cityId = player.cities[0]
  if (cityId) {
    const city = next.cities[cityId]!
    const options = (Object.keys(BUILDINGS) as BuildingType[]).filter(
      (b) => !city.buildings.includes(b) && city.level >= BUILDINGS[b].unlockLevel,
    )
    if (options.length && rng.next() > 0.4) {
      next = buildInCity(next, cityId, rng.pick(options))
    }
  }

  // Accept quest
  const openQuest = next.quests.find((q) => !q.completed && q.acceptedBy === null)
  if (openQuest && rng.next() > 0.5) {
    next = acceptQuest(next, openQuest.id)
  }

  // Move squad toward quest, boss, or expand
  const squadId = player.squads[0]
  if (squadId) {
    const squad = next.squads[squadId]!
    const targetQuest = next.quests.find((q) => q.acceptedBy === player.id && !q.completed)
    const targetBoss = next.bosses.find((b) => !b.defeated)
    let tq = squad.q
    let tr = squad.r
    if (targetQuest) {
      tq = targetQuest.locationQ
      tr = targetQuest.locationR
    } else if (targetBoss && player.victoryPath === 'legend') {
      tq = targetBoss.q
      tr = targetBoss.r
    } else {
      const unclaimed = next.map.filter((t) => t.ownerId === null && axialDistance(t.q, t.r, squad.q, squad.r) === 1)
      if (unclaimed.length) {
        const t = rng.pick(unclaimed)
        next = moveSquad(next, squadId, t.q, t.r)
        if (next.phase === 'combat') return next
        next = claimTile(next, t.q, t.r)
        return next
      }
    }
    // Step toward target
    const neighbors = hexNeighbors(squad.q, squad.r)
      .map(([q, r]) => findTile(next.map, q, r))
      .filter((t): t is HexTile => !!t)
      .sort(
        (a, b) =>
          axialDistance(a.q, a.r, tq, tr) - axialDistance(b.q, b.r, tq, tr),
      )
    if (neighbors[0] && squad.movesLeft > 0) {
      next = moveSquad(next, squadId, neighbors[0].q, neighbors[0].r)
    }
  }

  return next
}

export function buildWonderInfluence(state: GameState): GameState {
  const player = state.players.find((p) => p.id === state.activePlayerId)!
  const cost = { gold: 8, stone: 6, mana: 4 }
  if (!canAfford(player.resources, cost)) return pushLog(state, 'Wonders demand greater tribute.')
  let next = updatePlayer(state, player.id, (p) => ({
    ...p,
    resources: pay(p.resources, cost),
    influence: p.influence + 10,
  }))
  return checkVictory(pushLog(next, `${player.name} raises a wonder. Influence surges.`))
}
