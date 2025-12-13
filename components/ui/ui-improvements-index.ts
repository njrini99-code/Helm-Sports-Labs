// UI Improvements Index
// All new and enhanced components for improved UI/UX

// Toast & Notifications
export { Toast, ToastProvider, ToastViewport, ToastWithIcon, useToast } from './toast';
export { Toaster } from './toaster';
export { useToast as useToastHook, toast } from './use-toast';

// Theme & Dark Mode
export { ThemeProvider } from './theme-provider';
export { ThemeToggle } from './theme-toggle';

// Forms & Validation
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from './form';
export { AutoSaveForm } from './auto-save-form';

// Navigation
export { Breadcrumbs } from './breadcrumbs';
export { ProgressIndicator } from './progress-indicator';

// Tables
export { VirtualizedTable } from './virtualized-table';

// Accessibility
export { SkipLink } from './skip-link';
export { AccessibilityControls } from './accessibility-controls';

// Dialogs & Modals
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  ConfirmationDialog,
} from './enhanced-dialog';
export { BottomSheet } from './bottom-sheet';

// Search & Filtering
export { EnhancedSearch } from './enhanced-search';
export { FilterChips } from './filter-chips';

// Micro-interactions
export {
  SuccessAnimation,
  ErrorShake,
  LoadingButton,
  RippleButton,
  HoverLift,
} from './micro-interactions';

// Data Visualization
export {
  ChartTooltip,
  ChartLegend,
  TrendIndicator,
} from './enhanced-chart';

// Error Handling
export {
  EnhancedErrorBoundary,
  useErrorHandler,
} from './enhanced-error-boundary';
