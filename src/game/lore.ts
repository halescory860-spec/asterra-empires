import { FACTIONS } from './data'
import type { FactionId, GameState, LoreCategory, LoreEntry, TerrainType } from './types'
import { createRng } from './rng'

/**
 * LORE Engine — Legends, Origins, Records, Echoes
 * Discovers civilization memory as players explore, research, and triumph.
 */

export const LORE_CATEGORIES: { id: LoreCategory; name: string; blurb: string }[] = [
  { id: 'legend', name: 'Legends', blurb: 'Myths spoken across Asterra' },
  { id: 'origin', name: 'Origins', blurb: 'How peoples and places began' },
  { id: 'record', name: 'Records', blurb: 'Chronicles written in stone and ink' },
  { id: 'echo', name: 'Echoes', blurb: 'Whispers left by ruins, bosses, and relics' },
]

type LoreTemplate = Omit<LoreEntry, 'id' | 'unlockedAtTurn' | 'discoveredBy'> & {
  id: string
}

const WORLD_LORE: LoreTemplate[] = [
  {
    id: 'world_awakening',
    category: 'legend',
    title: 'The Awakening of Asterra',
    summary: 'Dragons return. Machines stir. Portals tear the veil.',
    body: 'When the ancient continent stirred, kingdoms that thought themselves eternal found the ground remembering older wars. Every victory now is written against a sky that may not hold.',
    tags: ['world', 'prologue'],
  },
  {
    id: 'world_sky_forge',
    category: 'record',
    title: 'Schema of the Sky Forge',
    summary: 'A wonder said to crown all knowledge.',
    body: 'Scholars argue whether the Sky Forge is machine, temple, or both. Completing its schema is said to bind a civilization to the bones of the world.',
    tags: ['technology', 'wonder'],
  },
  {
    id: 'world_portals',
    category: 'echo',
    title: 'The First Portal Storm',
    summary: 'Monsters poured through wounds in the air.',
    body: 'Witnesses describe a night when the horizon became a broken mirror. What stepped through was not native to Asterra—and some of it still hunts the wild hexes.',
    tags: ['portal', 'monster'],
  },
]

const TERRAIN_LORE: Partial<Record<TerrainType, LoreTemplate>> = {
  forest: {
    id: 'place_forest',
    category: 'origin',
    title: 'The Green Memory',
    summary: 'Forests that remember footsteps.',
    body: 'Old rangers claim the deep woods keep a ledger of every hunt. Leave a trail of mercy, and the canopy opens; leave cruelty, and the paths close.',
    tags: ['forest', 'place'],
  },
  desert: {
    id: 'place_desert',
    category: 'legend',
    title: 'Thirst of the Glass Sea',
    summary: 'Dunes that once drowned empires.',
    body: 'Beneath the sand lie roads of a vanished trade league. At noon the heat sings; at dusk the dunes answer with names no living tongue should know.',
    tags: ['desert', 'place'],
  },
  mountains: {
    id: 'place_mountains',
    category: 'record',
    title: 'Spine of the Continent',
    summary: 'Peaks carved by titans and miners alike.',
    body: 'Survey tablets mark iron veins older than kingdoms. Climbers leave cairns not for glory, but so the mountain remembers who asked permission.',
    tags: ['mountains', 'place'],
  },
  snow: {
    id: 'place_snow',
    category: 'echo',
    title: 'White Silence',
    summary: 'Frost that preserves oaths.',
    body: 'In the high white, sound travels strangely. Some expeditions return with frostbitten maps and stories of voices arguing in a dead dialect.',
    tags: ['snow', 'place'],
  },
  plains: {
    id: 'place_plains',
    category: 'origin',
    title: 'The First Harvest',
    summary: 'Where cities learned to feed armies.',
    body: 'Grain fields taught law: share the surplus, guard the seed, mark the seasons. Every capital still owes its first wall to a plow.',
    tags: ['plains', 'place'],
  },
  river: {
    id: 'place_river',
    category: 'legend',
    title: 'The Speaking Current',
    summary: 'Rivers as roads of prophecy.',
    body: 'Merchants swear the water carries rumors faster than riders. Follow a river upstream and you follow a civilization to its argument with the land.',
    tags: ['river', 'place'],
  },
  swamp: {
    id: 'place_swamp',
    category: 'echo',
    title: 'Lanterns in the Mire',
    summary: 'Bog-lights that are not lights.',
    body: 'The swamp keeps what falls into it—armor, idols, unfinished treaties. At night the lanterns rearrange themselves into constellations no sky owns.',
    tags: ['swamp', 'place'],
  },
  ruins: {
    id: 'place_ruins',
    category: 'record',
    title: 'Ash Archives',
    summary: 'Ruins that still file their histories.',
    body: 'Broken colonnades hide ledgers burned into ceramic. Whoever ruled here measured power in both tribute and stories—and both remain unfinished.',
    tags: ['ruins', 'place'],
  },
  cave: {
    id: 'place_cave',
    category: 'origin',
    title: 'Mouth of the Underworld',
    summary: 'Caves as thresholds, not endings.',
    body: 'Miners and mystics share one warning: do not assume the dark is empty. Asterra’s oldest machines preferred silence and stone.',
    tags: ['cave', 'place'],
  },
  dungeon: {
    id: 'place_dungeon',
    category: 'echo',
    title: 'The Locked Spiral',
    summary: 'Dungeons built to keep something in—or out.',
    body: 'Every dungeon door has two keys: one of iron, one of courage. The LORE engine marks each descent as a question the world has not answered.',
    tags: ['dungeon', 'place'],
  },
}

const FACTION_ORIGIN: Record<FactionId, LoreTemplate> = {
  ironLegion: {
    id: 'origin_ironLegion',
    category: 'origin',
    title: 'Founding of the Iron Legion',
    summary: 'Roman-forged order on Asterra’s frontier.',
    body: 'They raised walls before temples and roads before songs. The Legion’s first law was simple: a city that feeds its people may earn the right to rule them.',
    tags: ['faction', 'ironLegion', 'government'],
  },
  stormclans: {
    id: 'origin_stormclans',
    category: 'origin',
    title: 'Sagas of the Stormclans',
    summary: 'Oaths cut into keel and axe.',
    body: 'The Clans measure honor in raids survived and winters shared. Their origins are not a single city, but a fleet of stories that refuse to sink.',
    tags: ['faction', 'stormclans'],
  },
  arcaneDominion: {
    id: 'origin_arcaneDominion',
    category: 'origin',
    title: 'Charter of the Arcane Dominion',
    summary: 'Towers that govern by theorem.',
    body: 'The Dominion began where a library refused to burn. From that ash they built courts of spell and scholarship—fragile armor, sharp minds.',
    tags: ['faction', 'arcaneDominion'],
  },
  wildHunt: {
    id: 'origin_wildHunt',
    category: 'origin',
    title: 'Circle of the Wild Hunt',
    summary: 'A people who negotiated with the green.',
    body: 'Before maps, there were trails. The Hunt’s origin is a pact: beasts walk beside rangers, and the forest is counted as kin, not quarry alone.',
    tags: ['faction', 'wildHunt'],
  },
  ashborn: {
    id: 'origin_ashborn',
    category: 'origin',
    title: 'Guildfire of the Ashborn',
    summary: 'Hunters who forge legend from monsters.',
    body: 'When villages burned, the Ashborn arrived with few numbers and perfect blades. Their origin story is a ledger of trophies—and the widows they refused to leave behind.',
    tags: ['faction', 'ashborn'],
  },
}

function makeEntry(
  template: LoreTemplate,
  turn: number,
  playerId: number,
): LoreEntry {
  return {
    ...template,
    unlockedAtTurn: turn,
    discoveredBy: playerId,
  }
}

export function createLoreState(factionId: FactionId, turn = 1, playerId = 0): {
  unlocked: LoreEntry[]
  seenIds: string[]
} {
  const starter = [
    makeEntry(WORLD_LORE[0]!, turn, playerId),
    makeEntry(FACTION_ORIGIN[factionId], turn, playerId),
  ]
  return {
    unlocked: starter,
    seenIds: starter.map((e) => e.id),
  }
}

export function hasLore(state: GameState, id: string): boolean {
  return state.lore.seenIds.includes(id)
}

function unlock(
  state: GameState,
  template: LoreTemplate | undefined,
  playerId: number,
): GameState {
  if (!template || hasLore(state, template.id)) return state
  const entry = makeEntry(template, state.turn, playerId)
  return {
    ...state,
    lore: {
      unlocked: [entry, ...state.lore.unlocked],
      seenIds: [...state.lore.seenIds, entry.id],
    },
    eventLog: [`LORE unlocked: ${entry.title}`, ...state.eventLog].slice(0, 40),
  }
}

export function unlockTerrainLore(
  state: GameState,
  terrain: TerrainType,
  playerId: number,
): GameState {
  return unlock(state, TERRAIN_LORE[terrain], playerId)
}

export function unlockFactionLore(state: GameState, factionId: FactionId, playerId: number): GameState {
  return unlock(state, FACTION_ORIGIN[factionId], playerId)
}

export function unlockBossLore(state: GameState, bossName: string, playerId: number): GameState {
  const id = `echo_boss_${bossName.replace(/\s+/g, '_').toLowerCase()}`
  if (hasLore(state, id)) return state
  const template: LoreTemplate = {
    id,
    category: 'echo',
    title: `Echo of the ${bossName}`,
    summary: `A world boss falls; its myth remains.`,
    body: `When the ${bossName} was slain, chroniclers wrote that the land exhaled. Trophy and terror share a shelf in the LORE engine—proof that Asterra can bleed, and that heroes can make it remember mercy.`,
    tags: ['boss', 'echo', bossName],
  }
  return unlock(state, template, playerId)
}

export function unlockQuestLore(state: GameState, questTitle: string, playerId: number): GameState {
  const id = `record_quest_${questTitle.replace(/\s+/g, '_').toLowerCase()}`
  if (hasLore(state, id)) return state
  const template: LoreTemplate = {
    id,
    category: 'record',
    title: `Record: ${questTitle}`,
    summary: 'A completed quest enters the chronicle.',
    body: `The deed called “${questTitle}” is now filed among living records. Future rulers may cite it as precedent—or warning—when the next crisis asks who will answer.`,
    tags: ['quest', 'record'],
  }
  return unlock(state, template, playerId)
}

export function unlockTechLore(state: GameState, techName: string, playerId: number): GameState {
  const id = `record_tech_${techName.replace(/\s+/g, '_').toLowerCase()}`
  if (hasLore(state, id)) return state
  const template: LoreTemplate = {
    id,
    category: 'record',
    title: `Advancement: ${techName}`,
    summary: 'Science and culture etch a new line in the codex.',
    body: `With ${techName} mastered, scribes update the Technology Mat and the LORE engine together. Knowledge is not only power—it is memory with a destination.`,
    tags: ['technology', 'record'],
  }
  return unlock(state, template, playerId)
}

export function unlockCityLore(state: GameState, cityName: string, playerId: number): GameState {
  const id = `origin_city_${cityName.replace(/\s+/g, '_').toLowerCase()}`
  if (hasLore(state, id)) return state
  const player = state.players.find((p) => p.id === playerId)
  const faction = player ? FACTIONS.find((f) => f.id === player.factionId) : null
  const template: LoreTemplate = {
    id,
    category: 'origin',
    title: `Founding of ${cityName}`,
    summary: 'A new settlement joins the Table Top of history.',
    body: `${cityName} rises under ${faction?.tableTop ?? 'a rising banner'}. Its first stones are an argument: that this people intends to stay, farm, govern, and be remembered.`,
    tags: ['city', 'origin'],
  }
  return unlock(state, template, playerId)
}

export function unlockRandomWorldLore(state: GameState, playerId: number): GameState {
  const remaining = WORLD_LORE.filter((l) => !hasLore(state, l.id))
  if (!remaining.length) return state
  const rng = createRng(state.seed + state.turn * 17 + playerId)
  return unlock(state, rng.pick(remaining), playerId)
}

export function loreByCategory(state: GameState, category: LoreCategory): LoreEntry[] {
  return state.lore.unlocked.filter((e) => e.category === category)
}

export function loreProgress(state: GameState): { unlocked: number; knownTotal: number } {
  const knownTotal =
    WORLD_LORE.length +
    Object.keys(TERRAIN_LORE).length +
    Object.keys(FACTION_ORIGIN).length +
    12 // estimated dynamic boss/quest/tech/city slots for UI meter
  return { unlocked: state.lore.seenIds.length, knownTotal }
}