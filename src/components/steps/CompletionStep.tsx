import React from "react";
import { motion } from "framer-motion";
import { usePursuit } from "@/context/PursuitContext";
import { useRouter } from "next/navigation";

const CompletionStep: React.FC = () => {
  const { state, resetForm } = usePursuit();
  const router = useRouter();
  const { gradeLevel, practicalFocusArea, academicFocuses } = state.setup;
  const { approvedVersion } = state.conceptSummary;

  const handleStartOver = () => {
    resetForm();
    router.push('/step/1');
  };

  const handleGoBack = () => {
    router.push('/step/4');
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primer-purple-light mb-6">
          Pursuit Complete!
        </h1>
        <p className="text-xl mb-8">
          Your pursuit has been created successfully. Here's a summary of your
          pursuit:
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-primer-gray-dark p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Pursuit Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-primer-purple-light">
                Grade Level
              </h3>
              <p>{gradeLevel}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primer-purple-light">
                Practical Focus Area
              </h3>
              <p>{practicalFocusArea}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primer-purple-light">
                Academic Focuses
              </h3>
              <ul className="list-disc list-inside">
                {academicFocuses.map((focus) => (
                  <li key={focus}>{focus}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-primer-gray-dark p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Pursuit Concept</h2>
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-line">
              {approvedVersion?.summary || "No concept summary available"}
            </p>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">
            What's Next?
          </h2>
          <p className="text-gray-300 mb-4">
            Your pursuit is now ready to be implemented in your classroom! Here
            are some next steps:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              Create a detailed lesson plan based on your pursuit concept
            </li>
            <li>Gather any necessary materials or resources</li>
            <li>
              Consider how you'll assess student learning throughout the pursuit
            </li>
            <li>
              Think about how you might adapt the pursuit for different learning
              needs
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-6 flex justify-center space-x-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="button-secondary"
          onClick={handleGoBack}
        >
          Go Back
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="button"
          onClick={handleStartOver}
        >
          Start Over
        </motion.button>
      </div>
    </div>
  );
};

export default CompletionStep;
