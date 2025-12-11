'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SelectableItem,
} from '@/components/bulk/SelectableItem';
import {
  Mail,
  Bookmark,
  Download,
  MoreVertical,
  Trash2,
  Tag,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkAction: (action: string, playerIds: string[]) => void;
  selectedPlayerIds: string[];
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkAction,
  selectedPlayerIds,
  className,
}: BulkActionsToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (selectedPlayerIds.length === 0) {
      toast.error('No players selected');
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkAction(action, selectedPlayerIds);
      toast.success(`${action} completed for ${selectedPlayerIds.length} player(s)`);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action.toLowerCase()}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700',
        'px-4 py-3 flex items-center justify-between shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {selectedCount} of {totalCount} selected
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
          className="text-xs"
        >
          {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkAction('add_to_watchlist')}
          disabled={isProcessing}
          className="gap-2"
        >
          <Bookmark className="w-4 h-4" />
          Add to Watchlist
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkAction('send_message')}
          disabled={isProcessing}
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Message
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkAction('export')}
          disabled={isProcessing}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleBulkAction('change_status')}>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Change Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('add_tag')}>
              <Tag className="w-4 h-4 mr-2" />
              Add Tag
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('add_note')}>
              <FileText className="w-4 h-4 mr-2" />
              Add Note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleBulkAction('remove_from_pipeline')}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Pipeline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
