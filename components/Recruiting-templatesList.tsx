'use client';

import GenericList from '@/components/shared/GenericList';

export default function RecruitingTemplatesList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/recruiting-templates"
      title="Message Templates"
      emptyMessage="No templates yet"
      emptyIcon="📋"
      onCreate={onCreate}
      createText="Create Template"
    />
  );
}
