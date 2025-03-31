import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePursuit } from "@/context/PursuitContext";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

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
    router.push("/step/2");
  };

  const handleSubmit = async () => {
    if (conceptSummary.trim()) {
      // Check if the user has edited the concept
      const hasEdited =
        conceptSummary.trim() !== originalSummary.current.trim();

      if (hasEdited) {
        // Only submit if the user has made changes
        setIsSubmitting(true);
        await submitConceptConfirmation(conceptSummary);
        setIsSubmitting(false);
      }

      // Proceed to the next step regardless
      router.push("/step/4");
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
      <div className="py-20">
        <div className="text-2xl mb-4">No concept summary available</div>
        <button
          className="button-secondary mt-4"
          onClick={() => router.push("/step/1")}
        >
          Back to Start
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-3xl">Pursuit Synopsis</h1>
      <p className="text-xl mb-4">
        We've taken your idea and shaped it into a concise summary of your
        pursuit. Please review and make any necessary adjustments to ensure it
        accurately reflects your vision.
      </p>

      <textarea
        className="input-field w-full h-64 resize-none"
        value={conceptSummary}
        onChange={(e) => setConceptSummary(e.target.value)}
        placeholder="Your pursuit concept summary..."
      ></textarea>

      <div className="flex justify-between">
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
            "Analyze my idea"
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ConceptConfirmationStep;
