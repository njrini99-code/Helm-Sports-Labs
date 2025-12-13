/**
 * Export utilities for CSV and Excel formats
 */

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  columns?: ExportColumn[];
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], columns?: ExportColumn[]): string {
  if (data.length === 0) return '';

  // Determine columns
  const exportColumns = columns || Object.keys(data[0]).map(key => ({
    key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  // Create header row
  const headers = exportColumns.map(col => col.label);
  const csvRows = [headers.join(',')];

  // Create data rows
  data.forEach(row => {
    const values = exportColumns.map(col => {
      let value = row[col.key];
      
      // Apply custom formatter if provided
      if (col.format) {
        value = col.format(value);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Escape commas and quotes in CSV
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: any[], options: ExportOptions = {}) {
  const { filename = 'export.csv', columns, includeHeaders = true } = options;
  
  const csv = includeHeaders 
    ? convertToCSV(data, columns)
    : convertToCSV(data, columns).split('\n').slice(1).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Convert data to Excel format (using CSV with .xlsx extension)
 * For true Excel format, you'd need a library like xlsx
 */
export function downloadExcel(data: any[], options: ExportOptions = {}) {
  const { filename = 'export.xlsx' } = options;
  
  // For now, export as CSV but with .xlsx extension
  // Excel will open it, though formatting may be limited
  // For full Excel support, integrate xlsx library
  downloadCSV(data, { ...options, filename: filename.replace('.xlsx', '.csv') });
  
  // TODO: Implement true Excel export using xlsx library
  // import * as XLSX from 'xlsx';
  // const ws = XLSX.utils.json_to_sheet(data);
  // const wb = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  // XLSX.writeFile(wb, filename);
}

/**
 * Export player data with common columns
 */
export function exportPlayers(players: any[], format: 'csv' | 'excel' = 'csv') {
  const columns: ExportColumn[] = [
    { key: 'full_name', label: 'Name' },
    { key: 'primary_position', label: 'Position' },
    { key: 'grad_year', label: 'Grad Year' },
    { key: 'high_school_name', label: 'High School' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'pitch_velo', label: 'Pitch Velocity' },
    { key: 'exit_velo', label: 'Exit Velocity' },
    { key: 'sixty_time', label: '60 Yard Dash' },
    { key: 'gpa', label: 'GPA', format: (v) => v ? v.toFixed(2) : '' },
  ];

  if (format === 'excel') {
    downloadExcel(players, { filename: 'players.xlsx', columns });
  } else {
    downloadCSV(players, { filename: 'players.csv', columns });
  }
}

/**
 * Export watchlist with recruiting info
 */
export function exportWatchlist(watchlist: any[], format: 'csv' | 'excel' = 'csv') {
  const columns: ExportColumn[] = [
    { key: 'player_name', label: 'Player Name' },
    { key: 'status', label: 'Status' },
    { key: 'added_at', label: 'Added Date', format: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { key: 'notes', label: 'Notes' },
    { key: 'last_contact', label: 'Last Contact', format: (v) => v ? new Date(v).toLocaleDateString() : '' },
  ];

  if (format === 'excel') {
    downloadExcel(watchlist, { filename: 'watchlist.xlsx', columns });
  } else {
    downloadCSV(watchlist, { filename: 'watchlist.csv', columns });
  }
}
