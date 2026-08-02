import type {
  BuildingType,
  CraftRecipe,
  FactionDef,
  HeroClass,
  HeroPerk,
  ResourceType,
  TechNode,
  TerrainType,
  UnitRole,
} from './types'

export const FACTIONS: FactionDef[] = [
  {
    id: 'ironLegion',
    name: 'The Iron Legion',
    tagline: 'Roman-forged discipline. Walls that do not yield.',
    traits: ['Strong defenses', 'Cheap armies', 'Bonus to city building'],
    tableTop: 'The Ancient Roman Civilization',
    legs: [
      { id: 'government', name: 'Government', detail: 'Senates, law, and ordered rule of cities.' },
      { id: 'agriculture', name: 'Agriculture', detail: 'Farms and grain that feed the legions.' },
      { id: 'art', name: 'Art', detail: 'Monuments, forums, and civic grandeur.' },
      { id: 'technology', name: 'Technology', detail: 'Roads, engineering, and siegecraft.' },
    ],
    color: '#8b4513',
    accent: '#c9a227',
    bonuses: {
      defense: 2,
      melee: 0,
      exploration: 0,
      research: 0,
      movement: 0,
      cityCost: -2,
      raid: false,
      summon: false,
      bossBonus: 0,
    },
  },
  {
    id: 'stormclans',
    name: 'The Stormclans',
    tagline: 'Viking fury. Raid hard. Leave nothing.',
    traits: ['Excellent melee', 'Faster exploration', 'Raid enemy resources'],
    tableTop: 'The Norse Seafarer Kingdoms',
    legs: [
      { id: 'government', name: 'Government', detail: 'Jarls, oaths, and clan councils.' },
      { id: 'agriculture', name: 'Agriculture', detail: 'Fishing, herds, and coastal harvests.' },
      { id: 'art', name: 'Art', detail: 'Sagas, carved ships, and hall songs.' },
      { id: 'technology', name: 'Technology', detail: 'Longships, ironwork, and navigation.' },
    ],
    color: '#2f4f6f',
    accent: '#7eb8da',
    bonuses: {
      defense: 0,
      melee: 2,
      exploration: 1,
      research: 0,
      movement: 1,
      cityCost: 0,
      raid: true,
      summon: false,
      bossBonus: 0,
    },
  },
  {
    id: 'arcaneDominion',
    name: 'The Arcane Dominion',
    tagline: 'Power woven from starlight and ruin.',
    traits: ['Powerful mages', 'Summon creatures', 'Faster research', 'Weak armor'],
    tableTop: 'The Arcane Scholar Realms',
    legs: [
      { id: 'government', name: 'Government', detail: 'Archmage courts and tower law.' },
      { id: 'agriculture', name: 'Agriculture', detail: 'Mana gardens and crystal orchards.' },
      { id: 'art', name: 'Art', detail: 'Spellcraft, relics, and luminous script.' },
      { id: 'technology', name: 'Technology', detail: 'Research, portals, and summoning.' },
    ],
    color: '#3d2a5c',
    accent: '#b8a0e0',
    bonuses: {
      defense: -1,
      melee: 0,
      exploration: 0,
      research: 2,
      movement: 0,
      cityCost: 0,
      raid: false,
      summon: true,
      bossBonus: 0,
    },
  },
  {
    id: 'wildHunt',
    name: 'The Wild Hunt',
    tagline: 'Rangers, beasts, and the endless green.',
    traits: ['Fast movement', 'Animals fight beside them', 'Excellent scouts'],
    tableTop: 'The Woodland Ranger Peoples',
    legs: [
      { id: 'government', name: 'Government', detail: 'Circle councils and trail law.' },
      { id: 'agriculture', name: 'Agriculture', detail: 'Foraging, groves, and living harvests.' },
      { id: 'art', name: 'Art', detail: 'Beastsong, totems, and green rites.' },
      { id: 'technology', name: 'Technology', detail: 'Scouting paths, bows, and beastcraft.' },
    ],
    color: '#2d4a22',
    accent: '#8fbc6a',
    bonuses: {
      defense: 0,
      melee: 1,
      exploration: 2,
      research: 0,
      movement: 2,
      cityCost: 0,
      raid: false,
      summon: true,
      bossBonus: 0,
    },
  },
  {
    id: 'ashborn',
    name: 'The Ashborn',
    tagline: 'Monster hunters. Elite blades. Legendary craft.',
    traits: ['Elite small squads', 'Boss-slayer bonuses', 'Craft legendary weapons'],
    tableTop: 'The Monster-Hunter Guilds',
    legs: [
      { id: 'government', name: 'Government', detail: 'Guild charters and hunter ranks.' },
      { id: 'agriculture', name: 'Agriculture', detail: 'Provision stores and trail rations.' },
      { id: 'art', name: 'Art', detail: 'Legendary arms and trophy craft.' },
      { id: 'technology', name: 'Technology', detail: 'Smithing, alchemy, and beast lore.' },
    ],
    color: '#5c2218',
    accent: '#e07a3a',
    bonuses: {
      defense: 1,
      melee: 1,
      exploration: 0,
      research: 0,
      movement: 0,
      cityCost: 0,
      raid: false,
      summon: false,
      bossBonus: 3,
    },
  },
]

export const HERO_CLASSES: {
  id: HeroClass
  name: string
  description: string
  hp: number
}[] = [
  { id: 'warrior', name: 'Warrior', description: 'Steel and resolve on the front line.', hp: 120 },
  { id: 'mage', name: 'Mage', description: 'Arcane devastation from afar.', hp: 80 },
  { id: 'rogue', name: 'Rogue', description: 'Shadows, blades, and stolen breath.', hp: 90 },
  { id: 'paladin', name: 'Paladin', description: 'Holy steel that shields the realm.', hp: 110 },
  { id: 'hunter', name: 'Hunter', description: 'Bow, beast, and open horizon.', hp: 95 },
  { id: 'berserker', name: 'Berserker', description: 'Rage that breaks formations.', hp: 130 },
]

export const HERO_PERKS: HeroPerk[] = [
  { id: 'dualWield', name: 'Dual Wield', description: '+2 attack when engaging in melee.', requiresLevel: 2 },
  { id: 'fireball', name: 'Fireball', description: 'Deal splash damage in combat.', requiresLevel: 2 },
  { id: 'sneakAttack', name: 'Sneak Attack', description: 'Ambush bonus on first strike.', requiresLevel: 2 },
  { id: 'dragonSlayer', name: 'Dragon Slayer', description: '+4 damage vs world bosses.', requiresLevel: 4 },
  { id: 'heavyArmor', name: 'Heavy Armor', description: '+2 defense for hero and squad.', requiresLevel: 3 },
  { id: 'smithing', name: 'Smithing', description: 'Crafting costs reduced by 25%.', requiresLevel: 3 },
  { id: 'speech', name: 'Speech', description: '+5 Influence from diplomacy.', requiresLevel: 2 },
  { id: 'alchemy', name: 'Alchemy', description: 'Potions restore extra HP.', requiresLevel: 3 },
]

export const TERRAIN_META: Record<
  TerrainType,
  { label: string; color: string; moveCost: number; yields: Partial<Record<ResourceType, number>> }
> = {
  forest: { label: 'Forest', color: '#2f5233', moveCost: 1, yields: { wood: 2, food: 1 } },
  desert: { label: 'Desert', color: '#c2a15a', moveCost: 2, yields: { gold: 1, oil: 1 } },
  mountains: { label: 'Mountains', color: '#6b6e76', moveCost: 2, yields: { stone: 2, iron: 1 } },
  snow: { label: 'Snow', color: '#d8e2ec', moveCost: 2, yields: { stone: 1, mana: 1 } },
  plains: { label: 'Plains', color: '#8fae5e', moveCost: 1, yields: { food: 2 } },
  river: { label: 'River', color: '#4a8fb8', moveCost: 2, yields: { food: 1, gold: 1 } },
  swamp: { label: 'Swamp', color: '#4a5c3a', moveCost: 2, yields: { mana: 1, wood: 1 } },
  ruins: { label: 'Ancient Ruins', color: '#7a6548', moveCost: 1, yields: { mana: 2, gold: 1 } },
  cave: { label: 'Cave', color: '#3a3230', moveCost: 1, yields: { iron: 2, stone: 1 } },
  dungeon: { label: 'Dungeon', color: '#2a1f28', moveCost: 1, yields: { dragonScales: 1, mana: 1 } },
}

export const BUILDINGS: Record<
  BuildingType,
  { name: string; cost: Partial<Record<ResourceType, number>>; effect: string; unlockLevel: number }
> = {
  farm: { name: 'Farm', cost: { wood: 3, food: 0 }, effect: '+2 Food / turn', unlockLevel: 1 },
  mine: { name: 'Mine', cost: { wood: 2, stone: 2 }, effect: '+2 Stone or Iron / turn', unlockLevel: 1 },
  blacksmith: { name: 'Blacksmith', cost: { iron: 3, stone: 2 }, effect: 'Unlock better equipment', unlockLevel: 2 },
  mageTower: { name: 'Mage Tower', cost: { stone: 3, mana: 2 }, effect: '+2 Mana / turn', unlockLevel: 2 },
  hospital: { name: 'Hospital', cost: { wood: 2, gold: 2 }, effect: 'Heal squads in city', unlockLevel: 2 },
  walls: { name: 'Walls', cost: { stone: 4, iron: 1 }, effect: '+4 City defense', unlockLevel: 1 },
  market: { name: 'Market', cost: { wood: 2, gold: 3 }, effect: '+2 Gold / turn', unlockLevel: 2 },
  university: { name: 'University', cost: { stone: 3, gold: 3 }, effect: '+2 Research / turn', unlockLevel: 3 },
}

export const UNIT_ROLES: Record<
  UnitRole,
  { name: string; hp: number; attack: number; defense: number; range: number; cost: Partial<Record<ResourceType, number>> }
> = {
  infantry: { name: 'Infantry', hp: 40, attack: 8, defense: 4, range: 1, cost: { food: 2, iron: 1 } },
  heavyGunner: { name: 'Heavy Gunner', hp: 45, attack: 12, defense: 3, range: 2, cost: { iron: 2, oil: 1 } },
  sniper: { name: 'Sniper', hp: 30, attack: 14, defense: 1, range: 3, cost: { food: 1, iron: 2 } },
  medic: { name: 'Medic', hp: 35, attack: 4, defense: 2, range: 1, cost: { food: 2, gold: 1 } },
  shieldBearer: { name: 'Shield Bearer', hp: 55, attack: 6, defense: 8, range: 1, cost: { iron: 2, stone: 1 } },
  mage: { name: 'Mage', hp: 28, attack: 13, defense: 1, range: 2, cost: { mana: 2, gold: 1 } },
  engineer: { name: 'Engineer', hp: 32, attack: 7, defense: 3, range: 1, cost: { iron: 1, wood: 2 } },
}

export const TECH_TREE: TechNode[] = [
  { id: 'crossbows', name: 'Crossbows', category: 'military', cost: 8, description: 'Ranged units +2 attack.', requires: [] },
  { id: 'cannons', name: 'Cannons', category: 'military', cost: 14, description: 'Siege power vs cities.', requires: ['crossbows'] },
  { id: 'rifles', name: 'Rifles', category: 'military', cost: 18, description: 'Gunners and snipers +3 attack.', requires: ['cannons'] },
  { id: 'steamArmor', name: 'Steam Armor', category: 'military', cost: 22, description: 'Infantry +3 defense.', requires: ['rifles'] },
  { id: 'airships', name: 'Airships', category: 'military', cost: 28, description: 'Ignore terrain move costs.', requires: ['steamArmor'] },
  { id: 'fireMagic', name: 'Fire Magic', category: 'magic', cost: 8, description: 'Mages deal burn damage.', requires: [] },
  { id: 'iceMagic', name: 'Ice Magic', category: 'magic', cost: 12, description: 'Slow enemy squads.', requires: ['fireMagic'] },
  { id: 'necromancy', name: 'Necromancy', category: 'magic', cost: 16, description: 'Raise fallen infantry once.', requires: ['iceMagic'] },
  { id: 'healing', name: 'Healing', category: 'magic', cost: 12, description: 'Medics heal +10 HP.', requires: ['fireMagic'] },
  { id: 'teleportation', name: 'Teleportation', category: 'magic', cost: 24, description: 'Move a squad 3 hexes instantly.', requires: ['necromancy', 'healing'] },
  { id: 'betterFarming', name: 'Better Farming', category: 'civilization', cost: 8, description: 'Farms produce +1 food.', requires: [] },
  { id: 'banking', name: 'Banking', category: 'civilization', cost: 12, description: '+2 gold from markets.', requires: ['betterFarming'] },
  { id: 'engineering', name: 'Engineering', category: 'civilization', cost: 16, description: 'Buildings cost less stone.', requires: ['banking'] },
  { id: 'medicine', name: 'Medicine', category: 'civilization', cost: 16, description: 'Cities heal adjacent squads.', requires: ['banking'] },
  { id: 'democracy', name: 'Democracy', category: 'civilization', cost: 22, description: '+8 Influence.', requires: ['engineering', 'medicine'] },
  { id: 'skyForge', name: 'Sky Forge', category: 'civilization', cost: 30, description: 'Wonder required for Knowledge victory.', requires: ['airships', 'teleportation', 'democracy'] },
]

export const CRAFT_RECIPES: CraftRecipe[] = [
  { id: 'greatsword', name: 'Greatsword', category: 'weapon', cost: { iron: 4, wood: 1 }, effect: 'Hero +3 attack' },
  { id: 'battleAxe', name: 'Battle Axe', category: 'weapon', cost: { iron: 3, wood: 2 }, effect: 'Hero melee +4' },
  { id: 'rifle', name: 'Rifle', category: 'weapon', cost: { iron: 3, oil: 2 }, effect: 'Snipers +2 attack' },
  { id: 'warHammer', name: 'War Hammer', category: 'weapon', cost: { iron: 4, stone: 2 }, effect: 'Bonus vs armor' },
  { id: 'magicStaff', name: 'Magic Staff', category: 'weapon', cost: { mana: 4, wood: 2 }, effect: 'Mages +3 attack' },
  { id: 'steelArmor', name: 'Steel Armor', category: 'armor', cost: { iron: 4 }, effect: 'Hero +2 defense' },
  { id: 'elvenArmor', name: 'Elven Armor', category: 'armor', cost: { wood: 3, mana: 2 }, effect: 'Hero +1 move' },
  { id: 'dragonBone', name: 'Dragon Bone Armor', category: 'armor', cost: { dragonScales: 3, iron: 2 }, effect: 'Hero +4 defense' },
  { id: 'ebonyArmor', name: 'Ebony Armor', category: 'armor', cost: { iron: 5, mana: 2 }, effect: 'Resist magic' },
  { id: 'mythrilArmor', name: 'Mythril Armor', category: 'armor', cost: { iron: 3, gold: 4, mana: 2 }, effect: 'Hero +3 def, +1 move' },
  { id: 'healingPotion', name: 'Healing Potion', category: 'potion', cost: { food: 1, mana: 1 }, effect: 'Restore 25 HP' },
  { id: 'invisibility', name: 'Invisibility', category: 'potion', cost: { mana: 2, gold: 1 }, effect: 'Ambush next fight' },
  { id: 'strength', name: 'Strength', category: 'potion', cost: { food: 2, iron: 1 }, effect: '+3 attack one battle' },
  { id: 'speed', name: 'Speed', category: 'potion', cost: { food: 1, oil: 1 }, effect: '+1 squad move' },
  { id: 'fireResist', name: 'Fire Resistance', category: 'potion', cost: { stone: 1, mana: 1 }, effect: 'Resist boss fire' },
]

export const QUEST_TEMPLATES = [
  { title: 'Rescue Villagers', description: 'Bandits hold a hamlet hostage. Free them before dusk.', difficulty: 1, rewards: { gold: 4, xp: 20, influence: 3 } },
  { title: 'Clear a Haunted Crypt', description: 'The dead will not rest. Purge the crypt.', difficulty: 2, rewards: { mana: 3, xp: 30, influence: 4, relic: true } },
  { title: 'Kill a Dragon', description: 'A dragon roosts nearby. Claim its scales.', difficulty: 4, rewards: { dragonScales: 2, xp: 60, legendary: 'Dragonfang Blade', influence: 8 } },
  { title: 'Escort a Caravan', description: 'Guide merchants through hostile wilds.', difficulty: 1, rewards: { gold: 5, food: 2, xp: 15, influence: 2 } },
  { title: 'Explore Dwemer Ruins', description: 'Ancient machines stir beneath the stone.', difficulty: 3, rewards: { iron: 3, oil: 2, xp: 40, relic: true } },
  { title: 'Hunt Legendary Beasts', description: 'Track apex predators across the biome.', difficulty: 3, rewards: { food: 3, xp: 35, ally: true, influence: 5 } },
  { title: 'Retrieve an Ancient Artifact', description: 'A relic of Asterra waits in forgotten halls.', difficulty: 3, rewards: { gold: 3, mana: 3, xp: 45, relic: true, influence: 6 } },
]

export const BOSS_TEMPLATES = [
  { name: 'Frost Dragon', hp: 180, attack: 18, loot: 'Frostheart Scale' },
  { name: 'Ancient Giant', hp: 200, attack: 16, loot: 'Titan Bone Club' },
  { name: 'Lich King', hp: 160, attack: 20, loot: 'Crown of Ash' },
  { name: 'Sand Worm', hp: 190, attack: 15, loot: 'Desert Pearl' },
  { name: 'Demon General', hp: 170, attack: 19, loot: 'Hellforged Blade' },
  { name: 'Titan Golem', hp: 220, attack: 14, loot: 'Core of Stone' },
]

export const CITY_NAMES = [
  'Aurelian', 'Skarnheim', 'Velithar', 'Thornwatch', 'Cindergate',
  'Mossford', 'Ironhold', 'Starfall', 'Ravencairn', 'Goldmere',
  'Duskspire', 'Frostholm', 'Emberreach', 'Silverfen', 'Blackroot',
]

export const EMPTY_RESOURCES = (): Record<ResourceType, number> => ({
  food: 0,
  wood: 0,
  stone: 0,
  iron: 0,
  gold: 0,
  mana: 0,
  oil: 0,
  dragonScales: 0,
})

export const STARTING_RESOURCES = (): Record<ResourceType, number> => ({
  food: 8,
  wood: 6,
  stone: 5,
  iron: 4,
  gold: 5,
  mana: 3,
  oil: 1,
  dragonScales: 0,
})

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  food: 'Food',
  wood: 'Wood',
  stone: 'Stone',
  iron: 'Iron',
  gold: 'Gold',
  mana: 'Mana',
  oil: 'Oil',
  dragonScales: 'Dragon Scales',
}
