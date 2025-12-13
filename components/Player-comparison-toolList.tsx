'use client';

import GenericList from '@/components/shared/GenericList';

export default function PlayerComparisonToolList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/player-comparison-tool"
      title="Comparison Tools"
      emptyMessage="No comparison tools yet"
      emptyIcon="🔧"
      onCreate={onCreate}
      createText="Create Tool"
    />
  );
}
