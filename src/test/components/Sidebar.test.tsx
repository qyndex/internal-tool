import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

// Mock the AuthProvider hook
vi.mock('../../lib/AuthProvider', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    signOut: vi.fn(),
  }),
}));

function renderSidebar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('renders the app title', () => {
    renderSidebar();
    expect(screen.getByText('Internal Tool')).toBeInTheDocument();
  });

  it('renders all nav links', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Records' })).toBeInTheDocument();
  });

  it('Dashboard link points to /', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
  });

  it('Records link points to /data', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Records' })).toHaveAttribute('href', '/data');
  });

  it('renders a <nav> landmark', () => {
    renderSidebar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('shows the user email', () => {
    renderSidebar();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders the sign-out button', () => {
    renderSidebar();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
