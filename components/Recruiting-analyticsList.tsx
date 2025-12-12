'use client';

import GenericList from '@/components/shared/GenericList';

export default function RecruitingAnalyticsList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/recruiting-analytics"
      title="Recruiting Analytics"
      emptyMessage="No analytics reports yet"
      emptyIcon="📊"
      onCreate={onCreate}
      createText="Create Report"
    />
  );
}
