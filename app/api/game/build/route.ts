import { BuildActionRequest, BuildActionResponse, executeBuildAction } from '@/gameState/actions'
import { apiController } from '@/utils/api-controller'

export const POST = apiController<BuildActionRequest, BuildActionResponse>(async payload => executeBuildAction(payload))

