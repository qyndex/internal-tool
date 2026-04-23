import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

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
    expect(screen.getByRole('link', { name: 'Data Table' })).toBeInTheDocument();
  });

  it('Dashboard link points to /', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
  });

  it('Data Table link points to /data', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Data Table' })).toHaveAttribute('href', '/data');
  });

  it('renders a <nav> landmark', () => {
    renderSidebar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
