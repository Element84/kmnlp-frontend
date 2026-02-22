import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './index';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main title text for the card',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle text',
    },
    showArrow: {
      control: 'boolean',
      description: 'Show or hide the arrow icon',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// Default card with location example from design
export const Default: Story = {
  args: {
    title: 'Gulf Shores',
    subtitle: 'Alabama, United States',
    showArrow: true,
  },
};

// Clickable card
export const Clickable: Story = {
  args: {
    title: 'Gulf Shores',
    subtitle: 'Alabama, United States',
    showArrow: true,
    onClick: () => console.log('Card clicked!'),
  },
};

// Card without subtitle
export const NoSubtitle: Story = {
  args: {
    title: 'Gulf Shores',
    showArrow: true,
  },
};

// Card without arrow
export const NoArrow: Story = {
  args: {
    title: 'Gulf Shores',
    subtitle: 'Alabama, United States',
    showArrow: false,
  },
};

// Multiple cards in a list
export const CardList: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <Card
        title="Gulf Shores"
        subtitle="Alabama, United States"
        onClick={() => console.log('Gulf Shores clicked')}
      />
      <Card
        title="Miami Beach"
        subtitle="Florida, United States"
        onClick={() => console.log('Miami Beach clicked')}
      />
      <Card
        title="Santa Monica"
        subtitle="California, United States"
        onClick={() => console.log('Santa Monica clicked')}
      />
      <Card
        title="Outer Banks"
        subtitle="North Carolina, United States"
        onClick={() => console.log('Outer Banks clicked')}
      />
    </div>
  ),
};

// Long text example
export const LongText: Story = {
  args: {
    title: 'Research Station at the Gulf Shores Marine Biology Center',
    subtitle: 'Alabama, United States of America, North America',
    showArrow: true,
    onClick: () => console.log('Long text card clicked'),
  },
};

// Expandable card with content
export const Expandable: Story = {
  args: {
    title: 'NOAA Coral Reef Watch CoralTemp SST',
    expandable: true,
    isExpanded: false,
    onClick: () => console.log('Expandable card toggled'),
    children: (
      <div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '14px', lineHeight: '1.5' }}>
          CoralTemp is derived from three different but related 5km daily gap-free SST data sets.
        </p>
        <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '12px', color: '#565c65', minWidth: '150px' }}>
            temporal coverage:
          </span>
          <span style={{ fontSize: '12px' }}>1985-01-01 to present</span>
        </div>
        <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '12px', color: '#565c65', minWidth: '150px' }}>
            spatial coverage:
          </span>
          <span style={{ fontSize: '12px' }}>Global</span>
        </div>
      </div>
    ),
  },
};

// Expandable card expanded
export const ExpandableExpanded: Story = {
  args: {
    title: 'NOAA Coral Reef Watch CoralTemp SST',
    expandable: true,
    isExpanded: true,
    onClick: () => console.log('Expandable card toggled'),
    children: (
      <div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '14px', lineHeight: '1.5' }}>
          CoralTemp is derived from three different but related 5km daily gap-free SST data sets.
        </p>
        <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '12px', color: '#565c65', minWidth: '150px' }}>
            temporal coverage:
          </span>
          <span style={{ fontSize: '12px' }}>1985-01-01 to present</span>
        </div>
        <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '12px', color: '#565c65', minWidth: '150px' }}>
            spatial coverage:
          </span>
          <span style={{ fontSize: '12px' }}>Global</span>
        </div>
      </div>
    ),
  },
};
