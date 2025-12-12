'use client';

import { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Download, 
  UserPlus, 
  X,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface BulkActionsToolbarProps<T extends { id: string }> {
  items: T[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onBulkAdd?: (ids: string[]) => Promise<void>;
  onBulkRemove?: (ids: string[]) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onBulkExport?: (items: T[]) => Promise<void>;
  onBulkStatusChange?: (ids: string[], status: string) => Promise<void>;
  availableStatuses?: string[];
  className?: string;
  itemName?: string; // e.g., "players", "colleges"
}

export function BulkActionsToolbar<T extends { id: string }>({
  items,
  selectedIds,
  onSelectionChange,
  onBulkAdd,
  onBulkRemove,
  onBulkDelete,
  onBulkExport,
  onBulkStatusChange,
  availableStatuses = [],
  className,
  itemName = 'items',
}: BulkActionsToolbarProps<T>) {
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === items.length && items.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.length === 0 ? [] : items.map(item => item.id)));
    }
  };

  const handleBulkAction = async (
    action: (ids: string[]) => Promise<void>,
    actionName: string
  ) => {
    if (selectedIds.size === 0) {
      toast.error(`Please select ${itemName} to ${actionName}`);
      return;
    }

    setIsProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      await action(ids);
      toast.success(`${actionName} ${selectedCount} ${itemName}`);
      onSelectionChange(new Set()); // Clear selection after action
    } catch (error) {
      toast.error(`Failed to ${actionName}`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0 && !allSelected && !someSelected) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="h-8"
        >
          <Square className="w-4 h-4 mr-1" />
          Select All
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg',
      className
    )}>
      <div className="flex items-center gap-2 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-8"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 mr-1 text-emerald-600" />
          ) : (
            <Square className="w-4 h-4 mr-1" />
          )}
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
      <div className="h-6 w-px bg-emerald-300"></div>
<Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          {selectedCount} {selectedCount === 1 ? itemName.slice(0, -1) : itemName} selected
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {onBulkAdd && (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleBulkAction(onBulkAdd, 'Add')}
            disabled={isProcessing}
            className="h-8 bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 mr-1" />
            )}
            Add
          </Button>
)}
        {onBulkRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(onBulkRemove, 'Remove')}
            disabled={isProcessing}
            className="h-8"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <X className="w-4 h-4 mr-1" />
            )}
            Remove
          </Button>
)}
        {onBulkDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(onBulkDelete, 'Delete')}
            disabled={isProcessing}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1" />
            )}
            Delete
          </Button>
)}
        {(onBulkExport || onBulkStatusChange) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="h-8"
              >
                <MoreHorizontal className="w-4 h-4 mr-1" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onBulkExport && (
                <DropdownMenuItem
                  onClick={() => {
                    const selectedItems = items.filter(item => selectedIds.has(item.id));
                    handleBulkAction(
                      async () => onBulkExport?.(selectedItems) || Promise.resolve(),
                      'Export'
                    );
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
)}
              {onBulkStatusChange && availableStatuses.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {availableStatuses.map(status => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleBulkAction(
                        async (ids) => onBulkStatusChange?.(ids, status) || Promise.resolve(),
                        `Change status to ${status}`
                      )}
                    >
                      {status}
                    </DropdownMenuItem>
)}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
)}
      </div>
    </div>
  );
}

