'use client';

import React from 'react';
import { PursuitProvider } from '@/context/PursuitContext';

export default function PursuitProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PursuitProvider>{children}</PursuitProvider>;
}
