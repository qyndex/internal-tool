import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../../pages/Signup';

const mockSignUp = vi.fn().mockResolvedValue({ error: null });

vi.mock('../../lib/AuthProvider', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

describe('Signup', () => {
  it('renders the create account heading', () => {
    renderSignup();
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders name, email, and password inputs', () => {
    renderSignup();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders a link to sign in', () => {
    renderSignup();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls signUp when form is submitted', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mockSignUp).toHaveBeenCalledWith('jane@example.com', 'password123', 'Jane Smith');
  });

  it('shows confirmation message after successful signup', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
  });

  it('shows error on failed signup', async () => {
    mockSignUp.mockResolvedValueOnce({ error: new Error('Email already taken') });

    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/email/i), 'taken@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email already taken');
  });
});
