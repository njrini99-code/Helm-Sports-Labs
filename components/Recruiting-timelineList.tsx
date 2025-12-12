'use client';

import GenericList from '@/components/shared/GenericList';

export default function RecruitingTimelineList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/recruiting-timeline"
      title="Recruiting Timelines"
      emptyMessage="No timelines yet"
      emptyIcon="📅"
      onCreate={onCreate}
      createText="Create Timeline"
    />
  );
}
