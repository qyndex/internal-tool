import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';

// Recharts uses ResizeObserver + SVG which jsdom doesn't fully support.
// Stub out the Chart component so Dashboard tests focus on stat cards.
vi.mock('../../components/Chart', () => ({
  default: () => <div data-testid="chart-stub" />,
}));

describe('Dashboard', () => {
  it('renders the heading', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders all stat card labels', () => {
    render(<Dashboard />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('renders stat card values', () => {
    render(<Dashboard />);
    expect(screen.getByText('1284')).toBeInTheDocument();
    expect(screen.getByText('45200')).toBeInTheDocument();
    expect(screen.getByText('312')).toBeInTheDocument();
  });

  it('renders the chart placeholder', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('chart-stub')).toBeInTheDocument();
  });
});
