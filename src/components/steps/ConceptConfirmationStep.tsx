import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePursuit } from "@/context/PursuitContext";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';

const ConceptConfirmationStep: React.FC = () => {
  const { state, submitConceptConfirmation } = usePursuit();
  const router = useRouter();
  const [conceptSummary, setConceptSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalSummary = useRef("");

  useEffect(() => {
    // Initialize with the generated concept summary if available
    if (state.conceptSummary.initialConcept) {
      setConceptSummary(state.conceptSummary.initialConcept);
      originalSummary.current = state.conceptSummary.initialConcept;
    }
  }, [state.conceptSummary.initialConcept]);

  const handlePrevious = () => {
    router.push('/step/2');
  };

  const handleSubmit = async () => {
    if (conceptSummary.trim()) {
      // Check if the user has edited the concept
      const hasEdited = conceptSummary.trim() !== originalSummary.current.trim();
      
      if (hasEdited) {
        // Only submit if the user has made changes
        setIsSubmitting(true);
        await submitConceptConfirmation(conceptSummary);
        setIsSubmitting(false);
      } else if (state.conceptSummary.initialFeedback) {
        // If not edited and we have initial feedback, use that to create the first version
        setIsSubmitting(true);
        await submitConceptConfirmation(conceptSummary);
        setIsSubmitting(false);
      }
      
      // Proceed to the next step regardless
      router.push('/step/4');
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="animate-pulse text-2xl text-primer-purple-light font-semibold mb-8">
          Processing your idea...
        </div>
        <svg
          className="animate-spin h-16 w-16 text-primer-purple"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-8 text-gray-300">
          We're crafting your pursuit concept...
        </p>
      </div>
    );
  }

  if (!state.conceptSummary.initialConcept) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="text-2xl text-primer-purple-light font-semibold mb-4">
          No concept summary available
        </div>
        <p className="text-gray-300">
          Please go back and submit your idea first
        </p>
        <button 
          className="button-secondary mt-4"
          onClick={() => router.push('/step/2')}
        >
          Back to Idea
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primer-purple-light mb-6">
          Confirm Your Pursuit Concept
        </h1>
        <p className="text-xl mb-4">
          We've taken your idea and shaped it into a concise summary of your pursuit.
        </p>
        <p className="text-lg text-gray-300 mb-8">
          Please review the summary below and make any necessary adjustments to ensure it accurately reflects your vision.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-primer-gray-dark p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Pursuit Concept</h2>
          <p className="text-gray-300 mb-4">
            You can edit this summary directly in the text box below:
          </p>
          <textarea
            className="input-field w-full h-64 resize-none"
            value={conceptSummary}
            onChange={(e) => setConceptSummary(e.target.value)}
            placeholder="Your pursuit concept summary..."
          ></textarea>
        </div>

        {state.conceptSummary.initialFeedback && (
          <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              Initial Feedback
            </h2>
            <p className="text-gray-300 mb-4">
              Here's what our system thinks about your concept:
            </p>
            <div className="space-y-4">
              {state.conceptSummary.initialFeedback.strengths && (
                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-2">Strengths</h3>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {state.conceptSummary.initialFeedback.strengths}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {state.conceptSummary.initialFeedback.areasForImprovement && (
                <div>
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">Areas for Improvement</h3>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {state.conceptSummary.initialFeedback.areasForImprovement}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {state.conceptSummary.initialFeedback.suggestions && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">Suggestions</h3>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {state.conceptSummary.initialFeedback.suggestions}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">
            What happens next?
          </h2>
          <p className="text-gray-300 mb-4">
            After you confirm this concept summary, we'll provide:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Detailed feedback on your pursuit concept</li>
            <li>Scores based on educational criteria</li>
            <li>Suggestions for improvement</li>
            <li>Questions to help refine your concept further</li>
          </ul>
        </div>

        <div className="pt-6 flex justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="button-secondary"
            onClick={handlePrevious}
          >
            Previous
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`button ${
              !conceptSummary.trim() || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleSubmit}
            disabled={!conceptSummary.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Confirm & Continue"
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ConceptConfirmationStep;
