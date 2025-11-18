import { WOODLAND_BOARD_DEFINITION } from './boardDefinition'
import {
  BuildingInstance,
  BuildingType,
  DecreeColumn,
  FactionId,
  GameState,
  TokenInstance,
  TokenType,
} from './schema'
import { recomputeDerivedGameState } from './scenarioState'

const cloneState = (state: GameState): GameState => JSON.parse(JSON.stringify(state)) as GameState

const clearingIndex = new Map(WOODLAND_BOARD_DEFINITION.clearings.map(clearing => [clearing.id, clearing]))

const assertClearingExists = (id: string) => {
  const clearing = clearingIndex.get(id)
  if (!clearing) {
    throw new Error(`Clearing ${id} does not exist on this board`)
  }
  return clearing
}

const ensureAdjacent = (from: string, to: string) => {
  const definition = assertClearingExists(from)
  if (!definition.adjacentClearings.includes(to)) {
    throw new Error(`Clearing ${from} is not adjacent to ${to}`)
  }
}

const ensureBuildingSlot = (state: GameState, clearingId: string) => {
  const clearingDefinition = assertClearingExists(clearingId)
  const clearingState = state.board.clearings[clearingId]
  if (!clearingState) {
    throw new Error(`Clearing state missing for ${clearingId}`)
  }
  if (clearingState.buildings.length >= clearingDefinition.buildingSlots) {
    throw new Error(`No available building slots in clearing ${clearingId}`)
  }
  return clearingState
}

const nextId = (prefix: string, existing: number) => `${prefix}_${Date.now()}_${existing}`

export type MoveActionRequest = {
  state: GameState
  faction: FactionId
  from: string
  to: string
  warriors: number
}

export type MoveActionResponse = {
  state: GameState
  moved: number
}

export const executeMoveAction = ({ state, faction, from, to, warriors }: MoveActionRequest): MoveActionResponse => {
  if (warriors <= 0) {
    throw new Error('You must move at least one warrior')
  }
  ensureAdjacent(from, to)
  const nextState = cloneState(state)
  const fromClearing = nextState.board.clearings[from]
  const toClearing = nextState.board.clearings[to]
  if (!fromClearing || !toClearing) {
    throw new Error('Clearing state missing for move')
  }
  const available = fromClearing.warriors[faction] ?? 0
  if (available < warriors) {
    throw new Error(`Not enough ${faction} warriors in ${from} (have ${available}, need ${warriors})`)
  }
  fromClearing.warriors[faction] = available - warriors
  toClearing.warriors[faction] = (toClearing.warriors[faction] ?? 0) + warriors
  if (fromClearing.warriors[faction] === 0) {
    delete fromClearing.warriors[faction]
  }
  recomputeDerivedGameState(nextState)
  return { state: nextState, moved: warriors }
}

export type BattleActionRequest = {
  state: GameState
  clearingId: string
  attacker: FactionId
  defender: FactionId
}

export type BattleActionResponse = {
  state: GameState
  dice: [number, number]
  attackerHits: number
  defenderHits: number
}

const rollBattleDice = (): [number, number] => {
  const die = () => Math.floor(Math.random() * 4)
  const a = die()
  const b = die()
  return a > b ? [a, b] : [b, a]
}

export const executeBattleAction = ({
  state,
  clearingId,
  attacker,
  defender,
}: BattleActionRequest): BattleActionResponse => {
  const nextState = cloneState(state)
  const clearing = nextState.board.clearings[clearingId]
  if (!clearing) {
    throw new Error(`Clearing ${clearingId} not found`)
  }
  const attackerPresence = clearing.warriors[attacker] ?? 0
  const defenderPresence = clearing.warriors[defender] ?? 0
  if (attackerPresence === 0 || defenderPresence === 0) {
    throw new Error('Both factions must have warriors in the clearing to battle')
  }
  const dice = rollBattleDice()
  const attackerHits = Math.min(dice[0], attackerPresence)
  const defenderHits = Math.min(dice[1], defenderPresence)
  clearing.warriors[defender] = Math.max(0, defenderPresence - attackerHits)
  clearing.warriors[attacker] = Math.max(0, attackerPresence - defenderHits)
  if (clearing.warriors[defender] === 0) delete clearing.warriors[defender]
  if (clearing.warriors[attacker] === 0) delete clearing.warriors[attacker]
  recomputeDerivedGameState(nextState)
  return { state: nextState, dice, attackerHits, defenderHits }
}

export type BuildActionRequest = {
  state: GameState
  faction: FactionId
  clearingId: string
  buildingType?: BuildingType
}

export type BuildActionResponse = {
  state: GameState
  building: BuildingInstance
}

const getDefaultBuildingType = (faction: FactionId, buildingType?: BuildingType): BuildingType => {
  if (faction === 'marquise') {
    if (!buildingType) throw new Error('Cats must specify which building to construct')
    if (!['sawmill', 'workshop', 'recruiter', 'keep'].includes(buildingType)) {
      throw new Error(`Invalid building type ${buildingType} for Marquise`)
    }
    return buildingType
  }
  if (faction === 'eyrie') {
    return 'roost'
  }
  if (faction === 'woodland_alliance') {
    if (!buildingType || !buildingType.startsWith('base_')) {
      throw new Error('Woodland Alliance must place a base matching the clearing suit')
    }
    return buildingType
  }
  throw new Error(`Unknown faction ${faction}`)
}

export const executeBuildAction = ({
  state,
  faction,
  clearingId,
  buildingType,
}: BuildActionRequest): BuildActionResponse => {
  const nextState = cloneState(state)
  const clearingState = ensureBuildingSlot(nextState, clearingId)
  const derivedType = getDefaultBuildingType(faction, buildingType)
  if (faction === 'woodland_alliance') {
    const clearingDefinition = assertClearingExists(clearingId)
    const expectedType = `base_${clearingDefinition.suit}`
    if (derivedType !== expectedType) {
      throw new Error(`Alliance must build ${expectedType} in ${clearingId}`)
    }
  }
  const newBuilding: BuildingInstance = {
    id: nextId(`${faction}_${derivedType}_${clearingId}`, clearingState.buildings.length),
    faction,
    type: derivedType,
    slotIndex: clearingState.buildings.length,
  }
  clearingState.buildings.push(newBuilding)
  recomputeDerivedGameState(nextState)
  return { state: nextState, building: newBuilding }
}

export type TokenActionRequest = {
  state: GameState
  faction: FactionId
  clearingId: string
  tokenType: TokenType
}

export type TokenActionResponse = {
  state: GameState
  token: TokenInstance
}

export const executeTokenPlacement = ({
  state,
  faction,
  clearingId,
  tokenType,
}: TokenActionRequest): TokenActionResponse => {
  if (tokenType === 'sympathy' && faction !== 'woodland_alliance') {
    throw new Error('Only the Woodland Alliance can place sympathy tokens')
  }
  const nextState = cloneState(state)
  const clearingState = nextState.board.clearings[clearingId]
  if (!clearingState) {
    throw new Error(`Clearing ${clearingId} not found`)
  }
  const token: TokenInstance = {
    id: nextId(`${faction}_${tokenType}_${clearingId}`, clearingState.tokens.length),
    faction,
    type: tokenType,
  }
  clearingState.tokens.push(token)
  recomputeDerivedGameState(nextState)
  return { state: nextState, token }
}

export type GameInfoSummary = {
  turn: GameState['turn']
  victoryTrack: GameState['victoryTrack']
  factionSupplies: {
    faction: FactionId
    warriors: number
    resources: Record<string, number>
  }[]
  clearings: {
    id: string
    suit: string
    warriors: Partial<Record<FactionId, number>>
    buildings: string[]
    tokens: string[]
  }[]
}

export const summarizeGameState = (state: GameState): GameInfoSummary => ({
  turn: state.turn,
  victoryTrack: state.victoryTrack,
  factionSupplies: [
    {
      faction: 'marquise',
      warriors: state.factions.marquise.warriorsInSupply,
      resources: {
        wood: state.factions.marquise.woodInSupply,
        sawmills: state.factions.marquise.totalSawmillsOnMap,
        workshops: state.factions.marquise.totalWorkshopsOnMap,
        recruiters: state.factions.marquise.totalRecruitersOnMap,
      },
    },
    {
      faction: 'eyrie',
      warriors: state.factions.eyrie.warriorsInSupply,
      resources: {
        roosts: state.factions.eyrie.roostsOnMap,
        decree: (Object.keys(state.factions.eyrie.decree.columns) as DecreeColumn[]).reduce(
          (acc, column) => ({ ...acc, [column]: state.factions.eyrie.decree.columns[column].length }),
          {},
        ),
      },
    },
    {
      faction: 'woodland_alliance',
      warriors: state.factions.woodland_alliance.warriorsInSupply,
      resources: {
        officers: state.factions.woodland_alliance.officers,
        sympathy: state.factions.woodland_alliance.sympathyOnMap,
      },
    },
  ],
  clearings: WOODLAND_BOARD_DEFINITION.clearings.map(def => {
    const clearingState = state.board.clearings[def.id]
    return {
      id: def.id,
      suit: def.suit,
      warriors: clearingState?.warriors ?? {},
      buildings: clearingState?.buildings.map(building => `${building.faction}:${building.type}`) ?? [],
      tokens: clearingState?.tokens.map(token => `${token.faction}:${token.type}`) ?? [],
    }
  }),
})

