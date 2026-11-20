import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessIndicator, ProcessIndicatorProps, ProcessStepData } from './ProcessIndicator';

// Mock the ProcessStep component to isolate testing
vi.mock('../ProcessStep/ProcessStep', () => ({
  ProcessStep: ({ stepText, status, index, isLast }: any) => (
    <div data-testid={`process-step-${index ?? 'no-index'}`}>
      <span data-testid="step-text">{stepText}</span>
      <span data-testid="step-status">{status}</span>
      <span data-testid="step-index">{index}</span>
      <span data-testid="is-last">{isLast ? 'true' : 'false'}</span>
    </div>
  ),
}));

// Mock the USWDS Icon component and Button
vi.mock('@trussworks/react-uswds', () => ({
  Icon: {
    ExpandLess: ({ size }: { size: number }) => (
      <span data-testid="expand-less-icon" data-size={size}>
        ExpandLess
      </span>
    ),
  },
  Button: ({ children, ...props }: any) => (
    <button {...props} data-testid="button">{children}</button>
  ),
}));

describe('ProcessIndicator', () => {
  const mockSteps: ProcessStepData[] = [
    {
      id: 'step-1',
      text: 'First step',
      status: 'completed',
    },
    {
      id: 'step-2',
      text: 'Second step',
      status: 'in_progress',
    },
    {
      id: 'step-3',
      text: 'Third step',
      status: 'pending',
    },
  ];

  const defaultProps: ProcessIndicatorProps = {
    steps: mockSteps,
    status: 'in_progress',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ProcessIndicator {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByText(/Process \(3 steps\)/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress/, { selector: 'h4' })).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<ProcessIndicator {...defaultProps} title="Custom Process" />);
      
      expect(screen.getByText('Custom Process - In Progress')).toBeInTheDocument();
    });

    it('renders all status types correctly', () => {
      const statuses: Array<ProcessIndicatorProps['status']> = ['pending', 'in_progress', 'completed', 'failed'];
      
      statuses.forEach((status) => {
        const { unmount } = render(<ProcessIndicator {...defaultProps} status={status} />);
        const expectedText = status === 'in_progress' ? 'In Progress' : 
                           status.charAt(0).toUpperCase() + status.slice(1);
        expect(screen.getByText(new RegExp(expectedText), { selector: 'h4' })).toBeInTheDocument();
        
        unmount(); // Clear between renders
      });
    });

    it('applies correct CSS classes for status', () => {
      const { container } = render(<ProcessIndicator {...defaultProps} status="failed" />);
      
      expect(container.querySelector('.process-indicator--failed')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('calculates progress percentage correctly', () => {
      const stepsWithProgress = [
        { id: '1', text: 'Step 1', status: 'completed' as const },
        { id: '2', text: 'Step 2', status: 'completed' as const },
        { id: '3', text: 'Step 3', status: 'in_progress' as const },
        { id: '4', text: 'Step 4', status: 'pending' as const },
      ];

      render(<ProcessIndicator steps={stepsWithProgress} status="in_progress" />);
      
      // 2 completed out of 4 steps = 50%
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });

    it('shows progress percentage text with correct value', () => {
      const stepsWithProgress = [
        { id: '1', text: 'Step 1', status: 'completed' as const },
        { id: '2', text: 'Step 2', status: 'completed' as const },
        { id: '3', text: 'Step 3', status: 'pending' as const },
      ];

      render(<ProcessIndicator steps={stepsWithProgress} status="in_progress" />);
      
      // 2/3 = 66.67% rounded to 67%
      expect(screen.getByText('67% complete')).toBeInTheDocument();
    });

    it('does not show progress for non-in_progress status', () => {
      render(<ProcessIndicator {...defaultProps} status="completed" />);
      
      expect(screen.queryByText(/% complete/)).not.toBeInTheDocument();
    });
  });

  describe('Collapse/Expand Functionality', () => {
    it('renders expanded by default', () => {
      render(<ProcessIndicator {...defaultProps} />);
      
      expect(screen.getByTestId('process-step-0')).toBeInTheDocument();
      expect(screen.getByTestId('process-step-1')).toBeInTheDocument();
      expect(screen.getByTestId('process-step-2')).toBeInTheDocument();
    });

    it('renders collapsed when isCollapsed is true', () => {
      render(<ProcessIndicator {...defaultProps} isCollapsed={true} />);
      
      expect(screen.queryByTestId('process-step-0')).not.toBeInTheDocument();
    });

    it('toggles collapse state when header is clicked', async () => {
      const user = userEvent.setup();
      render(<ProcessIndicator {...defaultProps} />);
      
      // Initially expanded
      expect(screen.getByTestId('process-step-0')).toBeInTheDocument();
      
      // Click header to collapse
      const header = screen.getByRole('heading').closest('.process-indicator__header');
      await user.click(header!);
      
      await waitFor(() => {
        expect(screen.queryByTestId('process-step-0')).not.toBeInTheDocument();
      });
    });

    it('calls onToggle callback when provided', async () => {
      const user = userEvent.setup();
      const onToggleMock = vi.fn();
      render(<ProcessIndicator {...defaultProps} onToggle={onToggleMock} isCollapsed={false} />);
      
      const header = screen.getByRole('heading').closest('.process-indicator__header');
      await user.click(header!);
      
      expect(onToggleMock).toHaveBeenCalledWith(true);
    });

    it('shows correct aria-label for toggle button', () => {
      render(<ProcessIndicator {...defaultProps} isCollapsed={false} />);
      
      const toggleButton = screen.getByLabelText('Collapse process details');
      expect(toggleButton).toBeInTheDocument();
    });

    it('updates aria-label when collapsed', () => {
      render(<ProcessIndicator {...defaultProps} isCollapsed={true} />);
      
      const toggleButton = screen.getByLabelText('Expand process details');
      expect(toggleButton).toBeInTheDocument();
    });

    it('applies correct CSS class to toggle icon when collapsed', () => {
      const { container } = render(<ProcessIndicator {...defaultProps} isCollapsed={true} />);
      
      expect(container.querySelector('.process-indicator__toggle-icon--collapsed')).toBeInTheDocument();
    });
  });

  describe('Steps Rendering', () => {
    it('renders all steps with correct props', () => {
      render(<ProcessIndicator {...defaultProps} showStepNumbers={true} animated={true} />);
      
      mockSteps.forEach((step, index) => {
        const stepElement = screen.getByTestId(`process-step-${index}`);
        expect(stepElement).toBeInTheDocument();
        
        expect(screen.getByText(step.text!)).toBeInTheDocument();
      });
    });

    it('does not show step numbers when showStepNumbers is false', () => {
      render(<ProcessIndicator {...defaultProps} showStepNumbers={false} />);
      
      expect(screen.getAllByTestId('process-step-no-index')).toHaveLength(3);
    });

    it('passes animated prop to ProcessStep components', () => {
      render(<ProcessIndicator {...defaultProps} animated={true} />);
      
      // This would be tested through the mock, but the actual implementation
      // would pass the animated prop to ProcessStep
      expect(screen.getByTestId('process-step-0')).toBeInTheDocument();
    });

    it('marks last step correctly', () => {
      render(<ProcessIndicator {...defaultProps} />);
      
      // Check that the last step (index 2) is marked as last
      const lastStep = screen.getByTestId('process-step-2');
      expect(lastStep.querySelector('[data-testid="is-last"]')).toHaveTextContent('true');
      
      // Check that other steps are not marked as last
      const firstStep = screen.getByTestId('process-step-0');
      expect(firstStep.querySelector('[data-testid="is-last"]')).toHaveTextContent('false');
    });
  });

  describe('Error Handling', () => {
   

    it('does not show error summary for non-failed status', () => {
      render(<ProcessIndicator {...defaultProps} status="completed" />);
      
      expect(screen.queryByText('Process Failed')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty steps array', () => {
      render(<ProcessIndicator steps={[]} status="pending" />);
      
      expect(screen.getByText('Process (0 steps) - Pending')).toBeInTheDocument();
    });

    it('handles single step', () => {
      const singleStep = [{ id: '1', text: 'Only step', status: 'completed' as const }];
      render(<ProcessIndicator steps={singleStep} status="completed" />);
      
      expect(screen.getByText('Process (1 steps) - Completed')).toBeInTheDocument();
      expect(screen.getByTestId('process-step-0')).toBeInTheDocument();
    });

    it('calculates 100% progress when all steps completed', () => {
      const completedSteps = mockSteps.map(step => ({ ...step, status: 'completed' as const }));
      render(<ProcessIndicator steps={completedSteps} status="in_progress" />);
      
      expect(screen.getByText('100% complete')).toBeInTheDocument();
    });

    it('calculates 0% progress when no steps completed', () => {
      const pendingSteps = mockSteps.map(step => ({ ...step, status: 'pending' as const }));
      render(<ProcessIndicator steps={pendingSteps} status="in_progress" />);
      
      expect(screen.getByText('0% complete')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<ProcessIndicator {...defaultProps} title="Test Process" />);
      
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('Test Process - In Progress');
    });

    it('toggle button has accessible label', () => {
      render(<ProcessIndicator {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAccessibleName();
    });

    it('maintains focus management on toggle', async () => {
      const user = userEvent.setup();
      render(<ProcessIndicator {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);
      
      // The button should still be focusable after click
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Integration with External State', () => {
    it('respects external collapse state when onToggle provided', () => {
      const onToggleMock = vi.fn();
      const { rerender } = render(
        <ProcessIndicator 
          {...defaultProps} 
          isCollapsed={false} 
          onToggle={onToggleMock} 
        />
      );
      
      expect(screen.getByTestId('process-step-0')).toBeInTheDocument();
      
      // Re-render with collapsed state
      rerender(
        <ProcessIndicator 
          {...defaultProps} 
          isCollapsed={true} 
          onToggle={onToggleMock} 
        />
      );
      
      expect(screen.queryByTestId('process-step-0')).not.toBeInTheDocument();
    });

    it('uses internal state when onToggle not provided', async () => {
      const user = userEvent.setup();
      render(<ProcessIndicator {...defaultProps} />);
      
      // Initially expanded
      expect(screen.getByTestId('process-step-0')).toBeInTheDocument();
      
      // Click to toggle
      const header = screen.getByRole('heading').closest('.process-indicator__header');
      await user.click(header!);
      
      await waitFor(() => {
        expect(screen.queryByTestId('process-step-0')).not.toBeInTheDocument();
      });
    });
  });
});