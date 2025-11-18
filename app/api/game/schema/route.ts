import { WOODLAND_BOARD_DEFINITION } from '@/gameState/boardDefinition'
import {
  BUILDING_TYPES,
  DECREE_COLUMNS,
  DEFAULT_ROOST_TRACK,
  DEFAULT_SYMPATHY_TRACK,
  FACTIONS,
  MARQUISE_BUILDING_TRACKS,
  MARQUISE_TOTAL_WARRIORS,
  MARQUISE_TOTAL_WOOD,
  PHASES,
  SUITS,
  TOKEN_TYPES,
  EYRIE_TOTAL_WARRIORS,
  WOODLAND_ALLIANCE_TOTAL_WARRIORS,
} from '@/gameState/schema'
import { NextResponse } from 'next/server'

const schemaSummary = {
  factions: FACTIONS,
  suits: SUITS,
  phases: PHASES,
  tokenTypes: TOKEN_TYPES,
  buildingTypes: BUILDING_TYPES,
  decreeColumns: DECREE_COLUMNS,
  totals: {
    marquise: {
      warriors: MARQUISE_TOTAL_WARRIORS,
      wood: MARQUISE_TOTAL_WOOD,
    },
    eyrie: {
      warriors: EYRIE_TOTAL_WARRIORS,
    },
    woodland_alliance: {
      warriors: WOODLAND_ALLIANCE_TOTAL_WARRIORS,
    },
  },
  tracks: {
    marquise: MARQUISE_BUILDING_TRACKS,
    eyrie: DEFAULT_ROOST_TRACK,
    woodland_alliance: DEFAULT_SYMPATHY_TRACK,
  },
  board: WOODLAND_BOARD_DEFINITION,
}

export const GET = async () => {
  try {
    return NextResponse.json(schemaSummary, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 })
  }
}

