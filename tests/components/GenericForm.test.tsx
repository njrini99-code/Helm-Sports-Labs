import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenericForm, { COMMON_FIELDS } from '@/components/shared/GenericForm';
import { toast } from 'sonner';

describe('GenericForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders form fields correctly', () => {
    render(
      <GenericForm
        endpoint="/api/test"
        fields={[COMMON_FIELDS.NAME, COMMON_FIELDS.DESCRIPTION]}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('displays required field indicators', () => {
    render(
      <GenericForm
        endpoint="/api/test"
        fields={[
          { ...COMMON_FIELDS.NAME, required: true },
          { ...COMMON_FIELDS.DESCRIPTION, required: false },
        ]}
      />
    );

    const nameLabel = screen.getByText(/name/i);
    expect(nameLabel.parentElement).toHaveTextContent('*');
  });

  it('validates required fields on submit', async () => {
    const onSuccess = vi.fn();

    render(
      <GenericForm
        endpoint="/api/test"
        fields={[{ ...COMMON_FIELDS.NAME, required: true }]}
        onSuccess={onSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('validates email fields correctly', async () => {
    render(
      <GenericForm
        endpoint="/api/test"
        fields={[COMMON_FIELDS.EMAIL]}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Invalid email
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('submits form data successfully', async () => {
    const mockResponse = { id: '123', name: 'Test Item' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const onSuccess = vi.fn();

    render(
      <GenericForm
        endpoint="/api/test"
        fields={[COMMON_FIELDS.NAME, COMMON_FIELDS.DESCRIPTION]}
        onSuccess={onSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await userEvent.type(nameInput, 'Test Name');
    await userEvent.type(descInput, 'Test Description');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Name',
          description: 'Test Description',
        }),
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Submitted successfully!');
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });

  it('handles submission errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Validation error' }),
    });

    const onError = vi.fn();

    render(
      <GenericForm
        endpoint="/api/test"
        fields={[COMMON_FIELDS.NAME]}
        onError={onError}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await userEvent.type(nameInput, 'Test');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });
    expect(onError).toHaveBeenCalled();
  });

  it('clears form after successful submission', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <GenericForm
        endpoint="/api/test"
        fields={[COMMON_FIELDS.NAME]}
      />
    );

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    await userEvent.type(nameInput, 'Test');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
    });
  });

  it('disables form during submission', async () => {
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    render(
      <GenericForm
        endpoint="/api/test"
        fields={[COMMON_FIELDS.NAME]}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await userEvent.type(nameInput, 'Test');
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(nameInput).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('applies custom validation rules', async () => {
    render(
      <GenericForm
        endpoint="/api/test"
        fields={[
          {
            name: 'password',
            label: 'Password',
            type: 'text',
            validation: (value) => {
              if (value.length < 8) return 'Password must be at least 8 characters';
              return null;
            },
          },
        ]}
      />
    );

    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'short');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('supports initial data for edit forms', () => {
    render(
      <GenericForm
        endpoint="/api/test"
        fields={[COMMON_FIELDS.NAME, COMMON_FIELDS.DESCRIPTION]}
        initialData={{ name: 'Existing Name', description: 'Existing Description' }}
      />
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue('Existing Name');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing Description');
  });

  it('supports custom HTTP methods', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <GenericForm
        endpoint="/api/test/123"
        method="PUT"
        fields={[COMMON_FIELDS.NAME]}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'Updated Name');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/test/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      });
    });
  });
});
