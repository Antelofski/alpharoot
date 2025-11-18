import { executeMoveAction, MoveActionRequest, MoveActionResponse } from '@/gameState/actions'
import { apiController } from '@/utils/api-controller'

export const POST = apiController<MoveActionRequest, MoveActionResponse>(async payload => executeMoveAction(payload))

