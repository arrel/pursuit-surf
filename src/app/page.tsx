'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the intro step
    router.push('/step/0');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to Pursuit Planner...</p>
      </div>
    </main>
  );
}
