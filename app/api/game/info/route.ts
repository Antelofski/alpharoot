import { SCENARIOS } from '@/constants/scenarios'
import { summarizeGameState } from '@/gameState/actions'
import { getScenarioGameState } from '@/gameState/scenarioState'
import { GameState } from '@/gameState/schema'
import { apiController } from '@/utils/api-controller'

export type GameInfoRequest = {
  scenarioIndex?: number
  state?: GameState
}

export type GameInfoResponse = {
  state: GameState
  summary: ReturnType<typeof summarizeGameState>
}

export const POST = apiController<GameInfoRequest, GameInfoResponse>(async ({ scenarioIndex, state }) => {
  const scenarioCount = SCENARIOS.length
  const sanitizedIndex =
    typeof scenarioIndex === 'number' && !Number.isNaN(scenarioIndex)
      ? Math.min(Math.max(scenarioIndex, 0), scenarioCount - 1)
      : 0
  const baseState = state ?? getScenarioGameState(sanitizedIndex)
  return {
    state: baseState,
    summary: summarizeGameState(baseState),
  }
})

