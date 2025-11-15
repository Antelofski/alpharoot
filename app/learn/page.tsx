'use client'
import { ChatInput } from '@/components/chatInput'
import { ChatViewer } from '@/components/chatViewer'
import { SCENARIOS } from '@/constants/scenarios'
import { TUTOR_SYSTEM_PROMPT } from '@/prompts/tutor'
import { useChatCompleteMutation } from '@/redux/api/common'
import { ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { DEFAULT_LIGHT_THEME } from '@wookiejin/react-component'
import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ChatCompletionParams } from '../api/chatComplete/route'

export default function Home() {
  const searchParams = useSearchParams()
  const scenario = SCENARIOS[Number(searchParams.get('scenario'))]
  const [tutorChatComplete, { isLoading: loadingTutorResponse }] = useChatCompleteMutation()
  const [playerChatComplete, { isLoading: loadingPlayerResponse }] = useChatCompleteMutation()
  const [tutorConversation, setTutorConversation] = useState<ChatCompletionParams['conversation']>([
    { role: 'system', content: TUTOR_SYSTEM_PROMPT },
    { role: 'assistant', content: 'Hi apprentice, I’m the Wise Cat.' },
  ])
  const [playerConversation, setPlayerConversation] = useState<ChatCompletionParams['conversation']>([])
  const [tutorMessage, setTutorMessage] = useState('')
  const [playerMessage, setPlayerMessage] = useState('')

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
      const newConversation = [...playerConversation, { role: 'user' as const, content: playerMessage }]
      setPlayerConversation(newConversation)
      setPlayerMessage('')
      const response = await playerChatComplete({ conversation: newConversation }).unwrap()
      setPlayerConversation(prev => [...prev, { role: 'assistant' as const, content: response.content }])
    }
  }, [loadingPlayerResponse, playerChatComplete, playerConversation, playerMessage])

  return (
    <ThemeProvider theme={DEFAULT_LIGHT_THEME}>
      <main>
        <Container>
          <TutorChatSection>
            <ChatContainer>
              <ChatViewer conversation={tutorConversation} />
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
              <ChatContainer>
                <ChatViewer conversation={playerConversation} />
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
  padding: 16px;
  background-image: url('/image/root4.png');
  background-size: cover;
  background-color: rgba(255, 255, 255, 0.8);
  background-blend-mode: lighten;
  background-position: center center;
`
