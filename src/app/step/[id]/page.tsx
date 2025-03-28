'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { usePursuit } from '@/context/PursuitContext';
import SetupStep from '@/components/steps/SetupStep';
import IdeaStep from '@/components/steps/IdeaStep';
import ConceptConfirmationStep from '@/components/steps/ConceptConfirmationStep';
import ConceptSummaryStep from '@/components/steps/ConceptSummaryStep';
import CompletionStep from '@/components/steps/CompletionStep';

export default function StepPage() {
  const params = useParams();
  const { state } = usePursuit();
  const stepId = parseInt(params.id as string);

  // Render the appropriate step component
  const renderStep = () => {
    switch (stepId) {
      case 1:
        return <SetupStep />;
      case 2:
        return <IdeaStep />;
      case 3:
        return <ConceptConfirmationStep />;
      case 4:
        return <ConceptSummaryStep />;
      case 5:
        return <CompletionStep />;
      default:
        return <SetupStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primer-gray-dark to-primer-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= state.currentStep
                        ? "bg-primer-purple"
                        : "bg-primer-gray-dark"
                    }`}
                  ></div>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                Step {stepId} of 5
              </div>
            </div>
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
