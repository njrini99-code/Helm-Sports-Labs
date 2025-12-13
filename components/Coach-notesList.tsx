'use client';

import GenericList from '@/components/shared/GenericList';

export default function CoachNotesList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/coach-notes"
      title="Coach Notes"
      emptyMessage="No coach notes yet"
      emptyIcon="📝"
      onCreate={onCreate}
      createText="Create Note"
    />
  );
}
