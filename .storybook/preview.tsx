// @ts-nocheck

import '@/index.css'
import React from 'react'
import { ThemeProvider } from '@/lib/theme'
import type { Preview } from '@storybook/react'

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview 