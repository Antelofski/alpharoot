import styled from '@emotion/styled'
import { ColorIcon, FillButton, TextInput, View } from '@wookiejin/react-component'

interface Props {
  diabled: boolean
  message: string
  editMessage: (s: string) => void
  chat: () => void
}

export const ChatInput = View<Props>(({ forwardedRef, message, diabled, chat, editMessage, ...props }) => {
  return (
    <MessageRow {...props}>
      <TextInput
        value={message}
        onChange={s => editMessage(s.replace(/\n/g, ''))}
        onEnter={chat}
        placeholder={'Type your message...'}
        ref={forwardedRef}
      />
      <FillButton fill="Contrast" onClick={chat} disabled={diabled}>
        <ColorIcon src={'/icon/send.png'} size={24} alt="send" />
      </FillButton>
    </MessageRow>
  )
})

const MessageRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  position: relative;
`
