'use client';

import GenericForm, { COMMON_FIELDS } from '@/components/shared/GenericForm';

export default function PlayerComparisonToolForm({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <GenericForm
      endpoint="/api/player-comparison-tool"
      fields={[COMMON_FIELDS.NAME, COMMON_FIELDS.DESCRIPTION]}
      submitText="Create Comparison Tool"
      onSuccess={onSuccess}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
    />
  );
}
