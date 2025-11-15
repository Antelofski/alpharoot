import '@emotion/react'
import { DEFAULT_THEME } from '@wookiejin/react-component'

declare module '@emotion/react' {
  export interface Theme {
    color: typeof DEFAULT_THEME.color
    font: typeof DEFAULT_THEME.font
    border: typeof DEFAULT_THEME.border
    elevation: typeof DEFAULT_THEME.elevation
    fill: typeof DEFAULT_THEME.fill
  }
}
