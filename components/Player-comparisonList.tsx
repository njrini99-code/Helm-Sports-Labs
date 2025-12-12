'use client';

import GenericList from '@/components/shared/GenericList';

export default function PlayerComparisonList({ onCreate }: { onCreate?: () => void }) {
  return (
    <GenericList
      endpoint="/api/player-comparison"
      title="Player Comparisons"
      emptyMessage="No player comparisons yet"
      emptyIcon="⚖️"
      onCreate={onCreate}
      createText="Compare Players"
    />
  );
}
