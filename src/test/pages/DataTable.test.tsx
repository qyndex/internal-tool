import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '../../pages/DataTable';

describe('DataTable', () => {
  it('renders the filter input', () => {
    render(<DataTable />);
    expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable />);
    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    render(<DataTable />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });

  it('renders status values', () => {
    render(<DataTable />);
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('updates filter input value when user types', async () => {
    const user = userEvent.setup();
    render(<DataTable />);
    const input = screen.getByPlaceholderText('Filter...');
    await user.type(input, 'Item A');
    expect(input).toHaveValue('Item A');
  });
});
