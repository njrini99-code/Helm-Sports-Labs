'use client';

import GenericForm, { COMMON_FIELDS } from '@/components/shared/GenericForm';

export default function RecruitingTemplatesForm({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <GenericForm
      endpoint="/api/recruiting-templates"
      fields={[COMMON_FIELDS.NAME, COMMON_FIELDS.DESCRIPTION]}
      submitText="Create Template"
      onSuccess={onSuccess}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
    />
  );
}
