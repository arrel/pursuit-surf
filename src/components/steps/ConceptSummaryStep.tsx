import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePursuit } from "@/context/PursuitContext";
import { ConceptSummaryVersion, RubricScore, QuestionAnswer } from "@/types";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

const ConceptSummaryStep: React.FC = () => {
  const {
    state,
    getCurrentVersion,
    setCurrentVersion,
    approveCurrentVersion,
    answerQuestions,
  } = usePursuit();
  const router = useRouter();
  const { versions, currentVersionIndex } = state.conceptSummary;
  const currentVersion = getCurrentVersion();
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset answers when version changes
  useEffect(() => {
    setAnswers([]);
  }, [currentVersionIndex]);

  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="animate-pulse text-2xl text-primer-purple-light font-semibold mb-8">
          Thinking...
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

  if (!currentVersion) {
    return (
      <div className="flex flex-col h-full py-20">
        <div className="text-2xl text-primer-purple-light font-semibold mb-4">
          No concept summary available
        </div>
        <button
          className="button-secondary mt-4"
          onClick={() => router.push("/step/1")}
        >
          Back to Start
        </button>
      </div>
    );
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitAnswers = async () => {
    if (answers.length > 0 && answers.every((a) => a.trim())) {
      setIsSubmitting(true);

      // Convert string answers to the new format with question and reason
      const formattedAnswers =
        currentVersion.questions?.map((q, index) => ({
          question: typeof q === "string" ? q : q.question,
          answer: answers[index],
        })) || [];

      await answerQuestions(formattedAnswers);
      setIsSubmitting(false);
      setAnswers([]);
    }
  };

  const handleSwitchVersion = (index: number) => {
    setCurrentVersion(index);
  };

  const handleApproveAndContinue = () => {
    approveCurrentVersion();
    router.push("/step/5");
  };

  const handlePrevious = () => {
    router.push("/step/3");
  };

  const meetsAllCriteria = () => {
    return currentVersion.scores.every((score) => score.score === 4);
  };

  const renderScoreItem = (score: RubricScore) => {
    const maxScore = 4; // Assume maxScore is always 4
    const percentage = (score.score / maxScore) * 100;
    return (
      <div key={score.criterion} className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">
            {score.criterion}
          </span>
          <span className="text-sm font-medium text-primer-purple-light">
            {score.score}/{maxScore}
          </span>
        </div>
        <div className="w-full bg-primer-gray-dark rounded-full h-2.5">
          <div
            className="bg-primer-purple h-2.5 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {score.feedback && (
          <p className="text-sm text-gray-400 mt-1">{score.feedback}</p>
        )}
      </div>
    );
  };

  const allPerfectScores = currentVersion.scores.every(
    (score) => score.score === 4
  );

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-3xl font-bold text-primer-purple-light mb-6">
        Concept Summary
      </h1>
      {versions.length > 1 && (
        <div className="mb-8">
          <p className="text-lg mb-4">Version History:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {versions.map((version, index) => (
              <button
                key={version.id}
                className={`px-3 py-1 rounded-md text-sm ${
                  index === currentVersionIndex
                    ? "bg-primer-purple text-white"
                    : "bg-primer-gray-dark text-gray-300"
                }`}
                onClick={() => handleSwitchVersion(index)}
              >
                Version {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-primer-gray-dark p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Pursuit Concept</h2>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{currentVersion.conceptSummary}</ReactMarkdown>
          </div>
        </div>

        {/* {currentVersion.strengths && (
          <div className="bg-primer-gray-dark p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{currentVersion.strengths}</ReactMarkdown>
            </div>
          </div>
        )}

        {currentVersion.areasForImprovement && (
          <div className="bg-primer-gray-dark p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Areas for Improvement
            </h2>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>
                {currentVersion.areasForImprovement}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {currentVersion.suggestions && (
          <div className="bg-primer-gray-dark p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Suggestions</h2>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{currentVersion.suggestions}</ReactMarkdown>
            </div>
          </div>
        )} */}

        <div className="bg-primer-gray-dark p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Rubric Scores</h2>
          <div className="space-y-2">
            {currentVersion.scores.map(renderScoreItem)}
          </div>
        </div>

        {allPerfectScores && (
          <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              Perfect Score!
            </h2>
            <p className="text-gray-300">
              Your pursuit concept has achieved a perfect score across all
              criteria.
            </p>
          </div>
        )}

        {currentVersion.questions && currentVersion.questions.length > 0 ? (
          <div className="bg-primer-gray-dark p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Refinement Questions
            </h2>
            <p className="text-gray-300 mb-4">
              Answer these questions to help improve your pursuit concept:
            </p>
            <div className="space-y-4">
              {currentVersion.questions.map((questionItem, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-lg">
                    {questionItem.criterion}: {questionItem.question}
                  </label>
                  <p className="text-sm text-gray-400 mb-2">
                    {questionItem.reason}
                  </p>
                  <textarea
                    className="input-field w-full h-24 resize-none"
                    placeholder="Your answer..."
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                  ></textarea>
                </div>
              ))}
              <div className="flex justify-between">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="button-secondary mt-4"
                  onClick={handlePrevious}
                >
                  Previous
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="button mt-4"
                  onClick={handleSubmitAnswers}
                  disabled={
                    !answers.length ||
                    !answers.every((a) => a?.trim()) ||
                    isSubmitting
                  }
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
                    "Submit Answers"
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              {meetsAllCriteria() ? "Perfect Score!" : "Looking Good!"}
            </h2>
            <p className="text-gray-300">
              {meetsAllCriteria()
                ? "Your pursuit concept meets all the rubric criteria excellently!"
                : "Your pursuit concept is well-developed. You can approve it as is or continue refining."}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <div className="flex-1 flex flex-col space-y-4">
            <h3 className="text-xl font-semibold">Ready to continue?</h3>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="button-secondary"
                onClick={handlePrevious}
              >
                Previous
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="button flex-grow"
                onClick={handleApproveAndContinue}
              >
                Approve & Continue
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptSummaryStep;
