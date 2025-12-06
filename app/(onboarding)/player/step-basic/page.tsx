'use client';

// Redirect to main onboarding page
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayerOnboardingBasicStep() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding/player');
  }, [router]);
  return null;
}
