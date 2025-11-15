'use client'
import { SCENARIOS } from '@/constants/scenarios'
import styled from '@emotion/styled'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function Home() {
  const { push } = useRouter()

  return (
    <main>
      <Container>
        {SCENARIOS.map(({ title, type, difficulty }, i) => (
          <Card key={i} onClick={() => push(`/learn?scenario=${i}`)}>
            <Image
              src={`/image/root${i + 1}.png`}
              fill={true}
              style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              alt=""
            />
            <DifficultyTag>{DIFFICULTIES[difficulty]}</DifficultyTag>
            <Title>
              <Tag>{type}</Tag>
              {title}
            </Title>
          </Card>
        ))}
      </Container>
    </main>
  )
}

const Card = styled.button`
  cursor: pointer;
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;

  :hover {
    box-shadow: rgba(0, 0, 0, 0.2) 0px 6px 16px;
  }
`

const Title = styled.div`
  position: absolute;
  z-index: 1;
  bottom: 16px;
  left: 16px;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 4px 12px;
  font-weight: bold;
  text-align: left;
  font-size: 24px;
  width: calc(100% - 32px);
`

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
`

const Tag = styled.div`
  padding: 4px;
  background-color: coral;
  color: white;
  font-size: 12px;
  width: fit-content;
`

const DifficultyTag = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
`
