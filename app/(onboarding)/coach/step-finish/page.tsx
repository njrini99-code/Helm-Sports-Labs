'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoachOnboardingFinishStep() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding/coach');
  }, [router]);
  return null;
}
