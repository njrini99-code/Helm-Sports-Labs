'use client';

import GenericList from '@/components/shared/GenericList';

export default function ExportFunctionalityList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/export-functionality"
      title="Export Functions"
      emptyMessage="No exports yet"
      emptyIcon="📤"
      onCreate={onCreate}
      createText="Create Export"
    />
  );
}
