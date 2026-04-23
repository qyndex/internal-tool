import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';

const mockSignIn = vi.fn().mockResolvedValue({ error: null });

vi.mock('../../lib/AuthProvider', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login', () => {
  it('renders the sign-in heading', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the sign-in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to sign up', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('calls signIn when form is submitted', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows error message on failed sign-in', async () => {
    mockSignIn.mockResolvedValueOnce({ error: new Error('Invalid credentials') });

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
