import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof Card> = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const WithContent: StoryObj<typeof Card> = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Netflix</CardTitle>
        <CardDescription>Entertainment • Monthly</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">$15.99</p>
        <p className="text-sm text-muted-foreground">
          Next billing: Feb 1, 2024
        </p>
      </CardContent>
    </Card>
  ),
};

export const Compact: StoryObj<typeof Card> = {
  render: () => (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Monthly Revenue</span>
          <span className="font-medium">$89.99</span>
        </div>
        <div className="flex justify-between">
          <span>Active Subscriptions</span>
          <span className="font-medium">5</span>
        </div>
      </CardContent>
    </Card>
  ),
};
