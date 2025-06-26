// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Primary',
  },
  tags: ['autodocs'],
}

export default meta

export const Primary: StoryObj<typeof Button> = {}
export const Secondary: StoryObj<typeof Button> = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
} 