import { BattleActionRequest, BattleActionResponse, executeBattleAction } from '@/gameState/actions'
import { apiController } from '@/utils/api-controller'

export const POST = apiController<BattleActionRequest, BattleActionResponse>(async payload =>
  executeBattleAction(payload),
)

