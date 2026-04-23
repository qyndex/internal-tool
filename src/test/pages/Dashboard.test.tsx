import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';

// Mock the Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

// Stub out the Chart component so Dashboard tests focus on stat cards
vi.mock('../../components/Chart', () => ({
  default: () => <div data-testid="chart-stub" />,
}));

const mockRecords = [
  { status: 'active', value: 1000 },
  { status: 'active', value: 2000 },
  { status: 'completed', value: 500 },
  { status: 'pending', value: 3000 },
];

const mockActivity = [
  { id: '1', action: 'Created record', created_at: '2024-01-15T10:00:00Z', user_id: null, record_id: null },
  { id: '2', action: 'Updated record', created_at: '2024-01-16T10:00:00Z', user_id: null, record_id: null },
];

beforeEach(() => {
  vi.clearAllMocks();

  mockLimit.mockResolvedValue({ data: mockActivity, error: null });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockSelect.mockImplementation(() => {
    return { data: mockRecords, error: null, order: mockOrder };
  });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'records') {
      return { select: () => Promise.resolve({ data: mockRecords, error: null }) };
    }
    if (table === 'activity_log') {
      return {
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: mockActivity, error: null }),
          }),
        }),
      };
    }
    return { select: mockSelect };
  });
});

describe('Dashboard', () => {
  it('renders the heading', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });

  it('renders stat card labels after loading', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Total Records')).toBeInTheDocument();
      expect(screen.getByText('Active Records')).toBeInTheDocument();
      expect(screen.getByText('Total Value')).toBeInTheDocument();
    });
  });

  it('renders computed stat values', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument(); // total records
      expect(screen.getByText('2')).toBeInTheDocument(); // active records
      expect(screen.getByText('$6,500')).toBeInTheDocument(); // total value
    });
  });

  it('renders the chart placeholder', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('chart-stub')).toBeInTheDocument();
    });
  });

  it('renders recent activity entries', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Created record')).toBeInTheDocument();
      expect(screen.getByText('Updated record')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => Promise.resolve({ data: null, error: { message: 'Network error' } }),
    }));

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Error loading dashboard')).toBeInTheDocument();
    });
  });
});
