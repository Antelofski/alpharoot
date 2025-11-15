'use client'
import { ChatInput } from '@/components/chatInput'
import { ChatViewer } from '@/components/chatViewer'
import { SCENARIOS } from '@/constants/scenarios'
import { ALLIANCE_SYSTEM_PROMPT } from '@/prompts/alliance'
import { EYRIE_SYSTEM_PROMPT } from '@/prompts/eyrie'
import { TUTOR_SYSTEM_PROMPT } from '@/prompts/tutor'
import { useChatCompleteMutation } from '@/redux/api/common'
import { ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { DEFAULT_LIGHT_THEME } from '@wookiejin/react-component'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatCompletionParams } from '../api/chatComplete/route'

export type MultiPartyChat = (ChatCompletionParams['conversation'][number] & {
  faction?: 'cat' | 'alliance' | 'eyrie'
})[]

export default function Home() {
  const searchParams = useSearchParams()
  const scenario = SCENARIOS[Number(searchParams.get('scenario'))]
  const [tutorChatComplete, { isLoading: loadingTutorResponse }] = useChatCompleteMutation()
  const [playerChatComplete, { isLoading: loadingPlayerResponse }] = useChatCompleteMutation()
  const [tutorConversation, setTutorConversation] = useState<ChatCompletionParams['conversation']>([
    { role: 'system', content: TUTOR_SYSTEM_PROMPT() },
    { role: 'assistant', content: 'Hi apprentice, I’m the Wise Cat.' },
  ])
  const [playerConversation, setPlayerConversation] = useState<MultiPartyChat>([])
  const [tutorMessage, setTutorMessage] = useState('')
  const [playerMessage, setPlayerMessage] = useState('')
  const tutorChatRef = useRef<HTMLDivElement>(null)
  const playerChatRef = useRef<HTMLDivElement>(null)

  const tutorChat = useCallback(async () => {
    if (!loadingTutorResponse) {
      const newConversation = [...tutorConversation, { role: 'user' as const, content: tutorMessage }]
      setTutorConversation(newConversation)
      setTutorMessage('')
      const response = await tutorChatComplete({ conversation: newConversation }).unwrap()
      setTutorConversation(prev => [...prev, { role: 'assistant' as const, content: response.content }])
    }
  }, [loadingTutorResponse, tutorChatComplete, tutorConversation, tutorMessage])

  const playerChat = useCallback(async () => {
    if (!loadingPlayerResponse) {
      const newConversation = [
        ...playerConversation,
        { role: 'user' as const, content: playerMessage, faction: 'cat' as const },
      ]
      setPlayerConversation(newConversation)
      setPlayerMessage('')
      const [allianceResponse, eyrieResponse] = await Promise.all([
        playerChatComplete({
          conversation: [
            { role: 'system', content: ALLIANCE_SYSTEM_PROMPT(scenario.allianceProfile, newConversation) },
            { role: 'user' as const, content: playerMessage },
          ],
        }).unwrap(),
        playerChatComplete({
          conversation: [
            { role: 'system', content: EYRIE_SYSTEM_PROMPT(scenario.eyrieProfile, newConversation) },
            { role: 'user' as const, content: playerMessage },
          ],
        }).unwrap(),
      ])
      setPlayerConversation(prev => [
        ...prev,
        { role: 'assistant' as const, faction: 'alliance', content: allianceResponse.content },
        { role: 'assistant' as const, faction: 'eyrie', content: eyrieResponse.content },
      ])
    }
  }, [
    loadingPlayerResponse,
    playerChatComplete,
    playerConversation,
    playerMessage,
    scenario.allianceProfile,
    scenario.eyrieProfile,
  ])

  useEffect(() => {
    if (tutorConversation) {
      tutorChatRef.current?.scrollTo(0, tutorChatRef.current.scrollHeight)
    }
  }, [tutorConversation])

  useEffect(() => {
    if (playerConversation) {
      playerChatRef.current?.scrollTo(0, playerChatRef.current.scrollHeight)
    }
  }, [playerConversation])

  return (
    <ThemeProvider theme={DEFAULT_LIGHT_THEME}>
      <main>
        <Container>
          <TutorChatSection>
            <ChatContainer ref={tutorChatRef}>
              <ChatViewer conversation={tutorConversation} isReplying={loadingTutorResponse} />
            </ChatContainer>
            <ChatInput
              message={tutorMessage}
              editMessage={setTutorMessage}
              chat={tutorChat}
              diabled={loadingTutorResponse}
            />
          </TutorChatSection>
          <GameContainer>
            <div>Game Board</div>
            <PlayerChatSection>
              <ChatContainer ref={playerChatRef}>
                <ChatViewer conversation={playerConversation} isReplying={loadingPlayerResponse} />
              </ChatContainer>
              <ChatInput
                message={playerMessage}
                editMessage={setPlayerMessage}
                chat={playerChat}
                diabled={loadingPlayerResponse}
              />
            </PlayerChatSection>
          </GameContainer>
        </Container>
      </main>
    </ThemeProvider>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  height: 100vh;
`

const TutorChatSection = styled.div`
  border: 3px solid black;
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
  overflow: hidden;
  padding: 8px;
  background-color: white;
`

const PlayerChatSection = styled.div`
  border: 3px solid #baa77e;
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
  overflow: hidden;
  padding: 8px;
`

const ChatContainer = styled.div`
  overflow: auto;
`

const GameContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  padding: 16px;
  background-image: url('/image/root4.png');
  background-size: cover;
  background-color: rgba(255, 255, 255, 0.8);
  background-blend-mode: lighten;
  background-position: center center;
`
