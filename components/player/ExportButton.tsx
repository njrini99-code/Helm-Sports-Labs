'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Printer, Loader2 } from 'lucide-react';
import { exportPlayerToPDF, downloadPlayerHTML } from '@/lib/export/pdf';
import type { Player } from '@/lib/types';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface PlayerMetric {
  metric_label: string;
  metric_value: string;
  metric_type?: string;
  verified_date?: string | null;
}

interface PlayerVideo {
  title: string;
  video_url: string;
  video_type?: string;
}

interface PlayerAchievement {
  achievement_text: string;
  achievement_date?: string | null;
}

interface ExportButtonProps {
  player: Player;
  metrics?: PlayerMetric[];
  videos?: PlayerVideo[];
  achievements?: PlayerAchievement[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function ExportButton({
  player,
  metrics = [],
  videos = [],
  achievements = [],
  variant = 'outline',
  size = 'sm',
  className = '',
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExportPDF = () => {
    setLoading(true);
    try {
      exportPlayerToPDF({ player, metrics, videos, achievements });
      toast.success('PDF export opened! Use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHTML = () => {
    setLoading(true);
    try {
      downloadPlayerHTML({ player, metrics, videos, achievements });
      toast.success('Profile downloaded as HTML');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportPDF}>
          <Printer className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadHTML}>
          <FileText className="w-4 h-4 mr-2" />
          Download HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Simple Export Button (no dropdown)
// ═══════════════════════════════════════════════════════════════════════════

export function SimpleExportButton({
  player,
  metrics = [],
  videos = [],
  achievements = [],
  variant = 'outline',
  size = 'sm',
  className = '',
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    try {
      exportPlayerToPDF({ player, metrics, videos, achievements });
      toast.success('PDF export opened!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      Export PDF
    </Button>
  );
}

export default ExportButton;


