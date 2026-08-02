export type ResourceType =
  | 'food'
  | 'wood'
  | 'stone'
  | 'iron'
  | 'gold'
  | 'mana'
  | 'oil'
  | 'dragonScales'

export type TerrainType =
  | 'forest'
  | 'desert'
  | 'mountains'
  | 'snow'
  | 'plains'
  | 'river'
  | 'swamp'
  | 'ruins'
  | 'cave'
  | 'dungeon'

export type FactionId =
  | 'ironLegion'
  | 'stormclans'
  | 'arcaneDominion'
  | 'wildHunt'
  | 'ashborn'

export type HeroClass =
  | 'warrior'
  | 'mage'
  | 'rogue'
  | 'paladin'
  | 'hunter'
  | 'berserker'

export type UnitRole =
  | 'infantry'
  | 'heavyGunner'
  | 'sniper'
  | 'medic'
  | 'shieldBearer'
  | 'mage'
  | 'engineer'

export type BuildingType =
  | 'farm'
  | 'mine'
  | 'blacksmith'
  | 'mageTower'
  | 'hospital'
  | 'walls'
  | 'market'
  | 'university'

export type VictoryPath = 'domination' | 'knowledge' | 'legend' | 'influence'

export type TechCategory = 'military' | 'magic' | 'civilization'

export type GamePhase =
  | 'landing'
  | 'setup'
  | 'playing'
  | 'combat'
  | 'victory'

export type Resources = Record<ResourceType, number>

export type TableLegId = 'government' | 'agriculture' | 'art' | 'technology'

export interface TableLeg {
  id: TableLegId
  name: string
  detail: string
}

export interface FactionDef {
  id: FactionId
  name: string
  tagline: string
  traits: string[]
  /** The Table Top: main topic of this faction's civilization */
  tableTop: string
  /** The Four Legs: supporting details under the main topic */
  legs: TableLeg[]
  color: string
  accent: string
  bonuses: {
    defense: number
    melee: number
    exploration: number
    research: number
    movement: number
    cityCost: number
    raid: boolean
    summon: boolean
    bossBonus: number
  }
}

export type FocusAction =
  | 'expand'
  | 'build'
  | 'research'
  | 'quest'
  | 'diplomacy'
  | 'dashboard'
  | 'lore'

export type LoreCategory = 'legend' | 'origin' | 'record' | 'echo'

export interface LoreEntry {
  id: string
  category: LoreCategory
  title: string
  summary: string
  body: string
  tags: string[]
  unlockedAtTurn: number
  discoveredBy: number
}

export interface LoreState {
  unlocked: LoreEntry[]
  seenIds: string[]
}

export interface LoreUnlock {
  id: string
  reason: string
}

export interface HeroPerk {
  id: string
  name: string
  description: string
  requiresLevel: number
}

export interface Hero {
  name: string
  class: HeroClass
  level: number
  xp: number
  perks: string[]
  equipment: string[]
  hp: number
  maxHp: number
}

export interface Unit {
  id: string
  role: UnitRole
  hp: number
  maxHp: number
  attack: number
  defense: number
  range: number
  suppressed: boolean
  inCover: boolean
  highGround: boolean
}

export interface Squad {
  id: string
  name: string
  q: number
  r: number
  units: Unit[]
  movesLeft: number
  ownerId: number
}

export interface City {
  id: string
  name: string
  q: number
  r: number
  level: number
  buildings: BuildingType[]
  isCapital: number // ownerId
  ownerId: number
  hp: number
  maxHp: number
}

export interface HexTile {
  q: number
  r: number
  terrain: TerrainType
  ownerId: number | null
  resource: ResourceType | null
  exploredBy: number[]
}

export interface Quest {
  id: string
  title: string
  description: string
  difficulty: number
  rewards: Partial<Resources> & {
    xp?: number
    influence?: number
    legendary?: string
    ally?: boolean
    relic?: boolean
  }
  acceptedBy: number | null
  completed: boolean
  locationQ: number
  locationR: number
}

export interface Boss {
  id: string
  name: string
  q: number
  r: number
  hp: number
  maxHp: number
  attack: number
  defeated: boolean
  loot: string
}

export interface TechNode {
  id: string
  name: string
  category: TechCategory
  cost: number
  description: string
  requires: string[]
}

export interface CraftRecipe {
  id: string
  name: string
  category: 'weapon' | 'armor' | 'potion'
  cost: Partial<Resources>
  effect: string
}

export interface DiplomacyLink {
  a: number
  b: number
  status: 'war' | 'peace' | 'alliance'
}

export interface Player {
  id: number
  name: string
  factionId: FactionId
  isHuman: boolean
  resources: Resources
  hero: Hero
  cities: string[]
  squads: string[]
  researched: string[]
  researchPoints: number
  influence: number
  relics: number
  legendaryQuests: number
  bossesDefeated: number
  crafted: string[]
  victoryPath: VictoryPath
}

export interface CombatState {
  attackerId: number
  defenderId: number
  attackerSquadId: string
  defenderSquadId: string | null
  bossId: string | null
  log: string[]
  turn: 'attacker' | 'defender'
  round: number
}

export interface GameState {
  phase: GamePhase
  seed: number
  turn: number
  activePlayerId: number
  players: Player[]
  map: HexTile[]
  mapRadius: number
  cities: Record<string, City>
  squads: Record<string, Squad>
  quests: Quest[]
  bosses: Boss[]
  diplomacy: DiplomacyLink[]
  combat: CombatState | null
  lore: LoreState
  eventLog: string[]
  winnerId: number | null
  winReason: string | null
}

export interface SetupConfig {
  playerCount: number
  humanName: string
  factionId: FactionId
  heroClass: HeroClass
  heroName: string
  victoryPath: VictoryPath
}
