import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenericList from '@/components/shared/GenericList';
import { toast } from 'sonner';

const mockItems = [
  { id: '1', name: 'Item 1', description: 'Description 1' },
  { id: '2', name: 'Item 2', description: 'Description 2' },
  { id: '3', name: 'Item 3', description: 'Description 3' },
];

describe('GenericList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('shows loading state initially', () => {
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<GenericList endpoint="/api/test" />);

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('renders items after loading', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    render(<GenericList endpoint="/api/test" />);

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  it('shows empty state when no items', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <GenericList
        endpoint="/api/test"
        emptyMessage="No items found"
        emptyIcon="📭"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('📭')).toBeInTheDocument();
    });
  });

  it('shows create button in empty state', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const onCreate = vi.fn();

    render(
      <GenericList
        endpoint="/api/test"
        onCreate={onCreate}
        createText="Create New Item"
      />
    );

    await waitFor(() => {
      const createButton = screen.getByText('Create New Item');
      expect(createButton).toBeInTheDocument();
      fireEvent.click(createButton);
      expect(onCreate).toHaveBeenCalled();
    });
  });

  it('renders item descriptions when present', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    render(<GenericList endpoint="/api/test" />);

    await waitFor(() => {
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  it('calls onEdit when edit button clicked', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    const onEdit = vi.fn();

    render(<GenericList endpoint="/api/test" onEdit={onEdit} />);

    await waitFor(async () => {
      const editButtons = screen.getAllByText(/edit/i);
      fireEvent.click(editButtons[0]);
      expect(onEdit).toHaveBeenCalledWith(mockItems[0]);
    });
  });

  it('handles delete with confirmation', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    // Mock window.confirm
    global.confirm = vi.fn(() => true);

    const onDelete = vi.fn();

    render(<GenericList endpoint="/api/test" onDelete={onDelete} />);

    await waitFor(async () => {
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Item 1"?'
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Item deleted successfully');
    expect(onDelete).toHaveBeenCalledWith(mockItems[0]);
  });

  it('cancels delete when user declines confirmation', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    global.confirm = vi.fn(() => false);

    render(<GenericList endpoint="/api/test" onDelete={vi.fn()} />);

    await waitFor(async () => {
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial fetch
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<GenericList endpoint="/api/test" />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load items');
    });
  });

  it('handles delete errors gracefully', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })
      .mockRejectedValueOnce(new Error('Delete failed'));

    global.confirm = vi.fn(() => true);

    render(<GenericList endpoint="/api/test" onDelete={vi.fn()} />);

    await waitFor(async () => {
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete item');
    });
  });

  it('refetches data when refreshTrigger changes', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockItems,
    });

    const { rerender } = render(
      <GenericList endpoint="/api/test" refreshTrigger={0} />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    rerender(<GenericList endpoint="/api/test" refreshTrigger={1} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('supports custom renderItem function', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    render(
      <GenericList
        endpoint="/api/test"
        renderItem={(item) => (
          <div key={item.id} data-testid="custom-item">
            Custom: {item.name}
          </div>
        )}
      />
    );

    await waitFor(() => {
      const customItems = screen.getAllByTestId('custom-item');
      expect(customItems).toHaveLength(3);
      expect(customItems[0]).toHaveTextContent('Custom: Item 1');
    });
  });

  it('renders title when provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    render(<GenericList endpoint="/api/test" title="My Items List" />);

    await waitFor(() => {
      expect(screen.getByText('My Items List')).toBeInTheDocument();
    });
  });

  it('shows create button in header when items exist', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    const onCreate = vi.fn();

    render(
      <GenericList
        endpoint="/api/test"
        title="My Items"
        onCreate={onCreate}
        showCreate={true}
      />
    );

    await waitFor(() => {
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      expect(onCreate).toHaveBeenCalled();
    });
  });

  it('removes deleted item from list', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    global.confirm = vi.fn(() => true);

    render(<GenericList endpoint="/api/test" onDelete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
});
