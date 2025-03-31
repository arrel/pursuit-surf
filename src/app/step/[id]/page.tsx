"use client";

import React from "react";
import { useParams } from "next/navigation";
import IntroStep from "@/components/steps/IntroStep";
import SetupStep from "@/components/steps/SetupStep";
import IdeaStep from "@/components/steps/IdeaStep";
import ConceptConfirmationStep from "@/components/steps/ConceptConfirmationStep";
import ConceptSummaryStep from "@/components/steps/ConceptSummaryStep";
import CompletionStep from "@/components/steps/CompletionStep";

export default function StepPage() {
  const params = useParams();
  const stepId = parseInt(params.id as string);

  // Render the appropriate step component
  const renderStep = () => {
    switch (stepId) {
      case 0:
        return <IntroStep />;
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
        return <IntroStep />;
    }
  };

  // Don't show step indicators for the intro step
  const showStepIndicators = stepId !== 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {showStepIndicators && (
            <div className="mb-8">
              <div className="relative w-full h-2 rounded-full bg-primer-gray-light">
                <div
                  style={{ width: `${(stepId / 5) * 100}%` }}
                  className="absolute h-2 rounded-full bg-primer-purple"
                ></div>
              </div>
            </div>
          )}
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
