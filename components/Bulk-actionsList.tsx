'use client';

import GenericList from '@/components/shared/GenericList';

export default function BulkActionsList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/bulk-actions"
      title="Bulk Actions"
      emptyMessage="No bulk actions yet"
      emptyIcon="📋"
      onCreate={onCreate}
      createText="Create Bulk Action"
    />
  );
}
