'use client';

import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { PursuitProvider } from '@/context/PursuitContext';
import Slide from '@/components/Slide';
import SetupStep from '@/components/steps/SetupStep';
import IdeaStep from '@/components/steps/IdeaStep';
import ConceptSummaryStep from '@/components/steps/ConceptSummaryStep';
import CompletionStep from '@/components/steps/CompletionStep';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <PursuitProvider>
        <Slide id="step-1" className="bg-gradient-to-b from-primer-gray-dark to-primer-gray">
          <SetupStep />
        </Slide>
        
        <Slide id="step-2" className="bg-gradient-to-b from-primer-gray to-primer-gray-dark">
          <IdeaStep />
        </Slide>
        
        <Slide id="step-3" className="bg-gradient-to-b from-primer-gray-dark to-primer-gray">
          <ConceptSummaryStep />
        </Slide>
        
        <Slide id="step-4" className="bg-gradient-to-b from-primer-gray to-primer-gray-dark">
          <CompletionStep />
        </Slide>
      </PursuitProvider>
    </main>
  );
}
