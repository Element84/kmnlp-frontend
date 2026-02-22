import type { Meta, StoryObj } from '@storybook/react-vite';
import { ViewportWarning } from './ViewportWarning';

const meta: Meta<typeof ViewportWarning> = {
  title: 'Layout/ViewportWarning',
  component: ViewportWarning,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The ViewportWarning component displays when the browser window is smaller than the USWDS desktop breakpoint (1024px).
It shows a NOAA logo and message indicating that the application requires a desktop computer.

The component automatically shows/hides based on screen size using CSS media queries, but can be forced to show using the \`--force-show\` modifier class for demonstration purposes.
        `,
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the component',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewportWarning>;

/**
 * Default viewport warning as it appears on small screens.
 * This story uses the `--force-show` modifier to display the warning regardless of screen size.
 */
export const Default: Story = {
  args: {
    className: 'viewport-warning--force-show',
  },
};

/**
 * The viewport warning as it naturally appears - hidden on desktop screens (>1024px) 
 * and visible on smaller screens. Resize your browser window or use device emulation 
 * to see the responsive behavior.
 */
export const ResponsiveBehavior: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: `
This story shows the natural responsive behavior of the component. 
- On desktop screens (>1024px): Hidden
- On smaller screens (≤1024px): Visible

Try resizing your browser window or using device emulation to test the breakpoint.
        `,
      },
    },
  },
};

/**
 * Mobile viewport demonstration showing how the component scales down on smaller devices.
 */
export const Mobile: Story = {
  args: {
    className: 'viewport-warning--force-show',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'The viewport warning optimized for mobile devices with smaller logo and text sizing.',
      },
    },
  },
};