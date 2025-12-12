'use client';

import GenericList from '@/components/shared/GenericList';

export default function EmailSequencesList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/email-sequences"
      title="Email Sequences"
      emptyMessage="No email sequences yet"
      emptyIcon="✉️"
      onCreate={onCreate}
      createText="Create Sequence"
    />
  );
}
