'use client';

import GenericList from '@/components/shared/GenericList';

export default function RecruitingPipelineList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/recruiting-pipeline"
      title="Recruiting Pipelines"
      emptyMessage="No recruiting pipelines yet"
      emptyIcon="🎯"
      onCreate={onCreate}
      createText="Create Pipeline"
    />
  );
}
