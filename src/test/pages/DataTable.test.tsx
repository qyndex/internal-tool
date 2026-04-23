import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '../../pages/DataTable';

// Mock AuthProvider
vi.mock('../../lib/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
}));

// Mock Supabase
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const mockRecords = [
  {
    id: 'rec-1',
    title: 'Q1 Revenue Report',
    status: 'completed',
    category: 'finance',
    value: 15200,
    created_by: 'user-123',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'rec-2',
    title: 'Server Migration',
    status: 'active',
    category: 'engineering',
    value: 8900,
    created_by: 'user-123',
    created_at: '2024-02-20T14:00:00Z',
    updated_at: '2024-02-20T14:00:00Z',
  },
];

function createChainableMock(finalResult: unknown) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const makeFn = () =>
    vi.fn().mockImplementation(() => {
      return new Proxy(chain, {
        get(_target, prop) {
          if (prop === 'then') {
            // Make the proxy thenable so await resolves to finalResult
            return (resolve: (val: unknown) => void) => resolve(finalResult);
          }
          if (!chain[prop as string]) {
            chain[prop as string] = makeFn();
          }
          return chain[prop as string];
        },
      });
    });
  return makeFn();
}

beforeEach(() => {
  vi.clearAllMocks();

  mockFrom.mockImplementation((table: string) => {
    if (table === 'records') {
      return createChainableMock({ data: mockRecords, error: null, count: 2 })();
    }
    if (table === 'activity_log') {
      return { insert: mockInsert };
    }
    return createChainableMock({ data: [], error: null, count: 0 })();
  });
});

describe('DataTable', () => {
  it('renders the page heading', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /records/i })).toBeInTheDocument();
    });
  });

  it('renders the search input', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by title...')).toBeInTheDocument();
    });
  });

  it('renders the create button', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new record/i })).toBeInTheDocument();
    });
  });

  it('renders column headers', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });
  });

  it('renders record data after loading', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByText('Q1 Revenue Report')).toBeInTheDocument();
      expect(screen.getByText('Server Migration')).toBeInTheDocument();
    });
  });

  it('renders status badges', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('renders edit and delete buttons for each row', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit Q1 Revenue Report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete Q1 Revenue Report/i })).toBeInTheDocument();
    });
  });

  it('opens create modal when clicking new record button', async () => {
    const user = userEvent.setup();
    render(<DataTable />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new record/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /new record/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /create record/i })).toBeInTheDocument();
    });
  });

  it('opens delete confirmation when clicking delete', async () => {
    const user = userEvent.setup();
    render(<DataTable />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete Q1 Revenue Report/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /delete Q1 Revenue Report/i }));

    expect(
      await screen.findByText(/Are you sure you want to delete this record/i, {}, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<DataTable />);
    expect(screen.getByText('Loading records...')).toBeInTheDocument();
  });

  it('shows the status filter dropdown', async () => {
    render(<DataTable />);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument();
    });
  });
});
