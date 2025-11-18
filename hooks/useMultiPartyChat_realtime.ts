import { ChatCompletionParams } from '@/app/api/chatComplete/route'
import { SCENARIOS } from '@/constants/scenarios'
import { ALLIANCE_SYSTEM_PROMPT } from '@/prompts/alliance'
import { EYRIE_SYSTEM_PROMPT } from '@/prompts/eyrie'
import { useChatCompleteMutation } from '@/redux/api/common'
import { last } from 'lodash'
import { useCallback, useState } from 'react'
import { useDebounce } from 'react-use'

export type MultiPartyChat = (ChatCompletionParams['conversation'][number] & {
  faction?: 'cat' | 'alliance' | 'eyrie'
})[]

export function useMultiPartyChat(scenario: (typeof SCENARIOS)[number]) {
  const [eyrieChatComplete, { isLoading: loadingEyrieResponse }] = useChatCompleteMutation()
  const [allianceChatComplete, { isLoading: loadingAllianceResponse }] = useChatCompleteMutation()

  const [conversation, setConversation] = useState<MultiPartyChat>([
    { role: 'assistant', content: 'Hi there, I am the Alliance faction.', faction: 'alliance' },
    { role: 'assistant', content: 'Greetings, I represent the Eyrie faction.', faction: 'eyrie' },
  ])
  const [playerMessage, setPlayerMessage] = useState('')

  const eyrieChat = useCallback(
    async (conversation: MultiPartyChat) => {
      const isRespond = Math.random() < 0.7
      if (isRespond) {
        await eyrieChatComplete({
          conversation: [
            { role: 'system', content: EYRIE_SYSTEM_PROMPT(scenario.eyrieProfile, conversation) },
            { role: 'user' as const, content: last(conversation)?.content ?? '' },
          ],
        })
          .unwrap()
          .then(({ content }) => {
            setConversation(conv => [
              ...conv,
              { role: 'assistant' as const, faction: 'eyrie' as const, content: content },
            ])
          })
      }
    },
    [eyrieChatComplete, scenario.eyrieProfile]
  )

  const allianceChat = useCallback(
    async (conversation: MultiPartyChat) => {
      const isRespond = Math.random() < 0.7
      if (isRespond) {
        await allianceChatComplete({
          conversation: [
            { role: 'system', content: ALLIANCE_SYSTEM_PROMPT(scenario.allianceProfile, conversation) },
            { role: 'user' as const, content: last(conversation)?.content ?? '' },
          ],
        })
          .unwrap()
          .then(({ content }) => {
            setConversation(conv => [
              ...conv,
              { role: 'assistant' as const, faction: 'alliance' as const, content: content },
            ])
          })
      }
    },
    [allianceChatComplete, scenario.allianceProfile]
  )

  const playerChat = useCallback(async () => {
    const newConversation = [
      ...conversation,
      { role: 'user' as const, content: playerMessage, faction: 'cat' as const },
    ]
    setConversation(newConversation)
    setPlayerMessage('')
  }, [conversation, playerMessage])

  useDebounce(
    () => {
      if (!loadingEyrieResponse && last(conversation)?.faction !== 'eyrie') {
        eyrieChat(conversation)
      }
    },
    5000,
    [conversation, eyrieChat, loadingEyrieResponse]
  )

  useDebounce(
    () => {
      if (!loadingAllianceResponse && last(conversation)?.faction !== 'alliance') {
        allianceChat(conversation)
      }
    },
    5000,
    [conversation, allianceChat, loadingAllianceResponse]
  )

  return {
    playerChat,
    setPlayerMessage,
    playerConversation: conversation,
    playerMessage,
    loadingAllianceResponse,
    loadingEyrieResponse,
  }
}
