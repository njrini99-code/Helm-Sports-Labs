'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayerOnboardingLinksStep() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding/player');
  }, [router]);
  return null;
}
