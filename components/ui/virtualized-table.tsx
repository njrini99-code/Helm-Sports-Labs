'use client';

import * as React from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  className?: string;
  headerClassName?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  emptyState?: {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
  };
  onRetry?: () => void;
  className?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: Set<string>;
  onSelectRow?: (id: string, selected: boolean) => void;
  getRowId?: (row: T) => string;
  rowHeight?: number;
  headerHeight?: number;
  maxHeight?: number;
}

type SortDirection = 'asc' | 'desc' | null;

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  emptyState,
  onRetry,
  className,
  onRowClick,
  selectedRows,
  onSelectRow,
  getRowId,
  rowHeight = 56,
  headerHeight = 48,
  maxHeight = 600,
}: VirtualizedTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    const column = columns.find((c) => c.id === sortColumn);
    if (!column?.accessorKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[column.accessorKey as keyof T];
      const bVal = b[column.accessorKey as keyof T];

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, columns]);

  const totalWidth = React.useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 200), 0);
  }, [columns]);

  const Row = React.useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const row = sortedData[index];
      const rowId = getRowId ? getRowId(row) : String(index);
      const isSelected = selectedRows?.has(rowId);

      return (
        <div
          style={style}
          className={cn(
            'flex items-center border-b hover:bg-muted/50 transition-colors cursor-pointer',
            isSelected && 'bg-muted',
            className
          )}
          onClick={() => onRowClick?.(row)}
          role="row"
          aria-rowindex={index + 2}
        >
          {onSelectRow && (
            <div className="px-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectRow(rowId, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-input"
                aria-label={`Select row ${index + 1}`}
              />
            </div>
          )}
          {columns.map((column) => {
            const cellContent = column.cell
              ? column.cell(row)
              : column.accessorKey
              ? row[column.accessorKey]
              : null;

            return (
              <div
                key={column.id}
                className={cn('px-4 flex-1', column.className)}
                style={{ minWidth: column.minWidth || column.width || 200 }}
              >
                {cellContent}
              </div>
            );
          })}
        </div>
      );
    },
    [sortedData, columns, onRowClick, selectedRows, onSelectRow, getRowId, className]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (sortedData.length === 0 && emptyState) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        {emptyState.icon && <div className="text-muted-foreground">{emptyState.icon}</div>}
        <div>
          <h3 className="font-semibold">{emptyState.title}</h3>
          {emptyState.description && (
            <p className="text-sm text-muted-foreground mt-1">{emptyState.description}</p>
          )}
        </div>
        {emptyState.actionLabel && emptyState.onAction && (
          <button
            onClick={emptyState.onAction}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {emptyState.actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden" role="table" aria-label="Data table">
      <div
        className="flex items-center border-b bg-muted/30 px-4 font-semibold"
        style={{ height: headerHeight }}
        role="row"
        aria-rowindex={1}
      >
        {onSelectRow && (
          <div className="px-4">
            <input
              type="checkbox"
              checked={selectedRows?.size === sortedData.length && sortedData.length > 0}
              onChange={(e) => {
                sortedData.forEach((row) => {
                  const rowId = getRowId ? getRowId(row) : String(sortedData.indexOf(row));
                  onSelectRow(rowId, e.target.checked);
                });
              }}
              className="h-4 w-4 rounded border-input"
              aria-label="Select all rows"
            />
          </div>
        )}
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              'px-4 flex-1 flex items-center gap-2',
              column.sortable && 'cursor-pointer hover:text-foreground',
              column.headerClassName
            )}
            style={{ minWidth: column.minWidth || column.width || 200 }}
            onClick={() => column.sortable && handleSort(column.id)}
            role="columnheader"
            aria-sort={
              sortColumn === column.id
                ? sortDirection === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
          >
            <span>{column.header}</span>
            {column.sortable && (
              <span className="text-muted-foreground">
                {sortColumn === column.id ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )
                ) : (
                  <ChevronsUpDown className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: Math.min(maxHeight, sortedData.length * rowHeight) }}>
        <List
          height={Math.min(maxHeight, sortedData.length * rowHeight)}
          itemCount={sortedData.length}
          itemSize={rowHeight}
          width="100%"
          className="scrollbar-thin"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
