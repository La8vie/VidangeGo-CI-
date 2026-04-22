// Tests unitaires pour l'authentification
// Vitest + Testing Library

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { authService } from '../../services/api';

// Mock du service d'authentification
vi.mock('../../services/api', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

// Mock du navigateur
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...await import('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form correctly', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Connexion/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email professionnel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/ })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Se connecter/ });
    
    await fireEvent.click(submitButton);

    expect(screen.getByText(/L'email est requis/)).toBeInTheDocument();
    expect(screen.getByText(/Le mot de passe est requis/)).toBeInTheDocument();
  });

  it('should show error for invalid email format', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email professionnel/);
    const submitButton = screen.getByRole('button', { name: /Se connecter/ });

    await fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/Format d'email invalide/)).toBeInTheDocument();
  });

  it('should call authService.login with correct credentials', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'USER'
      }
    };

    authService.login.mockResolvedValue(mockLoginResponse);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email professionnel/);
    const passwordInput = screen.getByLabelText(/Mot de passe/);
    const submitButton = screen.getByRole('button', { name: /Se connecter/ });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('should handle login error correctly', async () => {
    const mockError = new Error('Identifiants invalides');
    authService.login.mockRejectedValue(mockError);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email professionnel/);
    const passwordInput = screen.getByLabelText(/Mot de passe/);
    const submitButton = screen.getByRole('button', { name: /Se connecter/ });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Identifiants invalides/)).toBeInTheDocument();
    });
  });

  it('should redirect to dashboard on successful login', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'USER'
      }
    };

    authService.login.mockResolvedValue(mockLoginResponse);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email professionnel/);
    const passwordInput = screen.getByLabelText(/Mot de passe/);
    const submitButton = screen.getByRole('button', { name: /Se connecter/ });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should redirect to admin dashboard for admin users', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'admin@vidangego.ci',
        role: 'ADMIN'
      }
    };

    authService.login.mockResolvedValue(mockLoginResponse);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email professionnel/);
    const passwordInput = screen.getByLabelText(/Mot de passe/);
    const submitButton = screen.getByRole('button', { name: /Se connecter/ });

    await fireEvent.change(emailInput, { target: { value: 'admin@vidangego.ci' } });
    await fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('should show loading state during login', async () => {
    authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Se connecter/ });
    const emailInput = screen.getByLabelText(/Email professionnel/);
    const passwordInput = screen.getByLabelText(/Mot de passe/);

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/Connexion en cours.../)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('should toggle password visibility', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/Mot de passe/) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /Afficher le mot de passe/ });

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');

    await fireEvent.click(toggleButton);

    // Password should be visible after click
    expect(passwordInput.type).toBe('text');
    expect(screen.getByRole('button', { name: /Masquer le mot de passe/ })).toBeInTheDocument();
  });

  it('should store token and user in localStorage on successful login', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'USER'
      }
    };

    authService.login.mockResolvedValue(mockLoginResponse);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email professionnel/);
    const passwordInput = screen.getByLabelText(/Mot de passe/);
    const submitButton = screen.getByRole('button', { name: /Se connecter/ });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockLoginResponse.user));
    });
  });
});
