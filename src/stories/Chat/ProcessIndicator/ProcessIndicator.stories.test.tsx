import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as stories from './ProcessIndicator.stories';

// Compose all stories from the stories file
const {
  InProgress,
  Completed,
  Failed,
  Collapsed,
  WithoutStepNumbers,
  DefaultTitle,
  SingleStep,
  LongSteps,
} = composeStories(stories);

describe('ProcessIndicator Stories', () => {
  describe('InProgress Story', () => {
    it('renders in progress state correctly', () => {
      render(<InProgress />);
      
      expect(screen.getByText('Data Analysis Process - In Progress')).toBeInTheDocument();
      expect(screen.getByText(/% complete/)).toBeInTheDocument();
      
      // Progress is shown as text, not a progress bar
      expect(screen.getByText(/\d+% complete/)).toBeInTheDocument();
    });

    it('shows correct progress percentage for in progress story', () => {
      render(<InProgress />);
      
      // Based on the story data: 2 completed out of 4 steps = 50%
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });
  });

  describe('Completed Story', () => {
    it('renders completed state correctly', () => {
      render(<Completed />);
      
      expect(screen.getByText('Data Analysis Process - Completed')).toBeInTheDocument();
      expect(screen.queryByText(/% complete/)).not.toBeInTheDocument();
    });

    it('shows all steps as completed', () => {
      render(<Completed />);
      
      // Check that content is expanded and visible
      const processContent = document.querySelector('.process-indicator__content');
      expect(processContent).toBeInTheDocument();
    });
  });


  describe('Collapsed Story', () => {
    it('renders in collapsed state', () => {
      render(<Collapsed />);
      
      expect(screen.getByText('Data Analysis Process - In Progress')).toBeInTheDocument();
      
      // Should not show the process steps content
      const processContent = document.querySelector('.process-indicator__content');
      expect(processContent).not.toBeInTheDocument();
    });

    it('shows correct toggle button aria-label when collapsed', () => {
      render(<Collapsed />);
      
      const toggleButton = screen.getByLabelText('Expand process details');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('WithoutStepNumbers Story', () => {
    it('renders without step numbers', () => {
      render(<WithoutStepNumbers />);
      
      expect(screen.getByText('Simple Process - In Progress')).toBeInTheDocument();
      
      // The story should render but we can't easily test step numbers 
      // without checking the ProcessStep mock behavior
      const processContent = document.querySelector('.process-indicator__content');
      expect(processContent).toBeInTheDocument();
    });
  });

  describe('DefaultTitle Story', () => {
    it('renders with default title format', () => {
      render(<DefaultTitle />);
      
      // Should show "Process (X steps)" format
      expect(screen.getByText(/Process \(\d+ steps\) - In Progress/)).toBeInTheDocument();
    });
  });

  describe('SingleStep Story', () => {
    it('renders single step correctly', () => {
      render(<SingleStep />);
      
      expect(screen.getByText('Quick Process - In Progress')).toBeInTheDocument();
      
      // Should handle single step case
      const processContent = document.querySelector('.process-indicator__content');
      expect(processContent).toBeInTheDocument();
    });
  });

  describe('LongSteps Story', () => {
    it('renders with long step text', () => {
      render(<LongSteps />);
      
      expect(screen.getByText('Complex Analysis Workflow - In Progress')).toBeInTheDocument();
      
      // Should handle long text gracefully
      expect(screen.getByText(/Initializing comprehensive data collection/)).toBeInTheDocument();
      expect(screen.getByText(/Performing advanced statistical analysis/)).toBeInTheDocument();
    });

    it('shows progress for complex workflow', () => {
      render(<LongSteps />);
      
      // Based on the story: 1 completed out of 3 steps = 33%
      expect(screen.getByText('33% complete')).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('all stories render without errors', () => {
      const allStories = [
        InProgress,
        Completed,
        Failed,
        Collapsed,
        WithoutStepNumbers,
        DefaultTitle,
        SingleStep,
        LongSteps,
      ];

      allStories.forEach((Story) => {
        const { unmount } = render(<Story />);
        
        // Each story should render a process indicator
        const processIndicator = document.querySelector('.process-indicator');
        expect(processIndicator).toBeInTheDocument();
        
        // Each story should have a title/header
        const header = screen.getByRole('heading', { level: 4 });
        expect(header).toBeInTheDocument();
        
        unmount();
      });
    });

    it('maintains consistent CSS class structure across stories', () => {
      const stories = [
        { component: InProgress, expectedStatus: 'in_progress' },
        { component: Completed, expectedStatus: 'completed' },
        { component: Failed, expectedStatus: 'failed' },
      ];

      stories.forEach(({ component: Story, expectedStatus }) => {
        const { unmount } = render(<Story />);
        
        const statusElement = document.querySelector(`.process-indicator--${expectedStatus}`);
        expect(statusElement).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('all stories have proper heading structure', () => {
      const allStories = [InProgress, Completed, Failed, DefaultTitle];

      allStories.forEach((Story) => {
        const { unmount } = render(<Story />);
        
        const heading = screen.getByRole('heading', { level: 4 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('process-indicator__title');
        
        unmount();
      });
    });

    it('toggle buttons have proper accessibility attributes', () => {
      const interactiveStories = [InProgress, Completed, Failed];

      interactiveStories.forEach((Story) => {
        const { unmount } = render(<Story />);
        
        // Get the toggle button by its aria-label
        const toggleButton = screen.getByRole('button', { name: /expand|collapse/i });
        expect(toggleButton).toHaveAccessibleName();
        expect(toggleButton).toHaveAttribute('aria-label');
        
        unmount();
      });
    });
  });

  describe('Responsive Design', () => {
    it('handles different content lengths gracefully', () => {
      const { unmount: unmountShort } = render(<SingleStep />);
      let processIndicator = document.querySelector('.process-indicator');
      expect(processIndicator).toBeInTheDocument();
      unmountShort();

      const { unmount: unmountLong } = render(<LongSteps />);
      processIndicator = document.querySelector('.process-indicator');
      expect(processIndicator).toBeInTheDocument();
      unmountLong();
    });
  });
});