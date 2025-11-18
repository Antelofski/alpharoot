import { TokenActionRequest, TokenActionResponse, executeTokenPlacement } from '@/gameState/actions'
import { apiController } from '@/utils/api-controller'

export const POST = apiController<TokenActionRequest, TokenActionResponse>(async payload =>
  executeTokenPlacement(payload),
)

