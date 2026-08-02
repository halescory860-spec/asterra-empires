import { FACTIONS, TECH_TREE, UNIT_ROLES } from './data'
import type { FactionId, GameState, Player, TableLegId } from './types'

export function getFactionTable(factionId: FactionId) {
  return FACTIONS.find((f) => f.id === factionId)!
}

/** Score 0–100 for each supporting leg of the faction table top. */
export function legScores(state: GameState, player: Player): Record<TableLegId, number> {
  const cities = player.cities.map((id) => state.cities[id]).filter(Boolean)
  const farms = cities.reduce((n, c) => n + c!.buildings.filter((b) => b === 'farm').length, 0)
  const markets = cities.reduce((n, c) => n + c!.buildings.filter((b) => b === 'market').length, 0)
  const unis = cities.reduce((n, c) => n + c!.buildings.filter((b) => b === 'university').length, 0)
  const militaryTechs = TECH_TREE.filter((t) => t.category === 'military' && player.researched.includes(t.id)).length
  const magicTechs = TECH_TREE.filter((t) => t.category === 'magic' && player.researched.includes(t.id)).length
  const civTechs = TECH_TREE.filter((t) => t.category === 'civilization' && player.researched.includes(t.id)).length
  const totalTech = TECH_TREE.length || 1

  const government = Math.min(
    100,
    player.influence * 2 +
      cities.length * 8 +
      (player.researched.includes('democracy') ? 20 : 0) +
      state.diplomacy.filter((d) => (d.a === player.id || d.b === player.id) && d.status === 'alliance').length * 10,
  )

  const agriculture = Math.min(
    100,
    player.resources.food * 3 +
      farms * 12 +
      (player.researched.includes('betterFarming') ? 15 : 0) +
      cities.reduce((n, c) => n + c!.level, 0) * 6,
  )

  const art = Math.min(
    100,
    player.legendaryQuests * 12 +
      player.relics * 10 +
      markets * 8 +
      player.hero.level * 6 +
      player.crafted.length * 4 +
      player.influence,
  )

  const technology = Math.min(
    100,
    Math.round((player.researched.length / totalTech) * 70) +
      unis * 8 +
      player.researchPoints * 2 +
      militaryTechs * 2 +
      magicTechs * 2 +
      civTechs * 3,
  )

  return { government, agriculture, art, technology }
}

export function dashboardStats(state: GameState, player: Player) {
  const livingUnits = player.squads
    .map((id) => state.squads[id])
    .filter(Boolean)
    .flatMap((s) => s!.units.filter((u) => u.hp > 0))

  const militaryStrength = livingUnits.reduce((sum, u) => {
    const role = UNIT_ROLES[u.role]
    return sum + role.attack + role.defense + Math.floor(u.hp / 10)
  }, 0)

  const population =
    player.cities.reduce((n, id) => {
      const city = state.cities[id]
      return n + (city ? 4 + city.level * 3 + city.buildings.length : 0)
    }, 0) + livingUnits.length

  const resourceTotal = Object.values(player.resources).reduce((a, b) => a + b, 0)

  return {
    militaryStrength,
    population,
    resourceTotal,
    cityCount: player.cities.length,
    squadCount: player.squads.length,
    researchDone: player.researched.length,
    researchMax: TECH_TREE.length,
  }
}
