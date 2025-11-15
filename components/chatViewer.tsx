import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { TextLoading } from '@wookiejin/react-component'
import { Color } from '@wookiejin/react-component/dist/cjs/themes/default/color'
import Image from 'next/image'
import { Fragment, memo } from 'react'

const PROFILE_SIZE = 40

interface Props {
  conversation: { role: 'assistant' | 'user' | 'system'; content: string; profileImage?: string }[]
  isReplying?: boolean
}

export const ChatViewer = memo(function ChatViewer({ conversation, isReplying = false }: Props) {
  return (
    <div>
      {conversation.map((message, i) => {
        if (message.role === 'assistant') {
          return (
            <Fragment key={i}>
              <MessageRow marginBottom={i < conversation.length - 1 ? 8 : 0}>
                <Profile>
                  <Image
                    src={message.profileImage ?? '/image/tutor.png'}
                    width={PROFILE_SIZE}
                    height={PROFILE_SIZE}
                    alt=""
                  />
                </Profile>
                <Bubble fill="#fbf2d1ff" color="Primary">
                  {message.content}
                </Bubble>
              </MessageRow>
            </Fragment>
          )
        } else if (message.role === 'user') {
          return (
            <UserMessageRow key={i}>
              <Bubble fill="black" color="Contrast">
                {message.content}
              </Bubble>
            </UserMessageRow>
          )
        }
      })}
      {isReplying && (
        <MessageRow>
          <Profile>
            {conversation[0].role !== 'system' ? (
              <>
                <Image src={'/image/alliance.png'} width={PROFILE_SIZE} height={PROFILE_SIZE} alt="" />
                <Image src={'/image/eyrie.png'} width={PROFILE_SIZE} height={PROFILE_SIZE} alt="" />
              </>
            ) : (
              <Image src={'/image/tutor.png'} width={PROFILE_SIZE} height={PROFILE_SIZE} alt="" />
            )}
          </Profile>
          <TextLoading fill="Contrast" marginTop={12} />
        </MessageRow>
      )}
    </div>
  )
})

const MessageRow = styled.div<{ marginBottom?: number }>`
  ${({ marginBottom = 0 }) => css`
    display: grid;
    grid-template-columns: auto fit-content(80%) auto;
    gap: 8px;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: ${marginBottom}px;
  `}
`

const UserMessageRow = styled.div`
  display: grid;
  justify-content: flex-end;
  align-items: flex-start;
  margin-bottom: 8px;
  grid-template-columns: fit-content(80%);
`

const Bubble = styled.div<{ fill: string; color: Color }>`
  ${({ theme, fill, color }) => css`
    background: ${fill};
    ${theme.color[color]}
    ${theme.font.Body}
    padding: 8px;
    border-radius: 8px;
    white-space: pre-wrap;
    min-width: 0;
  `}
`

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`
