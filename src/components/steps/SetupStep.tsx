import React from "react";
import { motion } from "framer-motion";
import { usePursuit } from "@/context/PursuitContext";
import { GradeLevel, PracticalFocusArea, AcademicFocus } from "@/types";
import { useRouter } from "next/navigation";

const SetupStep: React.FC = () => {
  const { state, updateSetup, completeSetup } = usePursuit();
  const { gradeLevel, practicalFocusArea, academicFocuses } = state.setup;
  const router = useRouter();

  const gradeLevels: GradeLevel[] = ["K-2nd", "3rd-5th", "6th-8th"];

  const practicalFocusAreas: PracticalFocusArea[] = [
    "💬 Communication",
    "🧠 Critical Thinking",
    "🏠 Daily Living",
    "🔄 Feedback",
    "💵 Personal Finance",
    "🎤 Public Speaking",
    "🪴 Self-Care",
    "✍🏻 Writing",
  ];

  const academicFocusOptions: AcademicFocus[] = [
    "🎭 Arts",
    "🤖 Computer Science",
    "📐 Math",
    "📚 Reading",
    "🔬 Science",
    "🏛️ Social Studies",
  ];

  const handleSelectGradeLevel = (level: GradeLevel) => {
    updateSetup({ gradeLevel: level });
  };

  const handleSelectPracticalFocus = (focus: PracticalFocusArea) => {
    updateSetup({ practicalFocusArea: focus });
  };

  const handleToggleAcademicFocus = (focus: AcademicFocus) => {
    const currentFocuses = [...academicFocuses];
    const index = currentFocuses.indexOf(focus);

    if (index >= 0) {
      // Remove if already selected
      currentFocuses.splice(index, 1);
    } else if (currentFocuses.length < 2) {
      // Add if less than 2 are selected
      currentFocuses.push(focus);
    } else {
      // Replace the first one if 2 are already selected
      currentFocuses.shift();
      currentFocuses.push(focus);
    }

    updateSetup({ academicFocuses: currentFocuses });
  };

  const isAcademicFocusSelected = (focus: AcademicFocus) => {
    return academicFocuses.includes(focus);
  };

  const isFormValid = () => {
    return gradeLevel && practicalFocusArea && academicFocuses.length > 0;
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      completeSetup();
      // Navigate to the next step using the router
      router.push("/step/2");
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-4xl mb-6">Tell us a bit about your pursuit</h1>

      <div className="space-y-10">
        {/* Grade Level Selection */}
        <div className="space-y-4">
          <h2 className="text-xl">
            1. What grade band is best suited for this pursuit?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gradeLevels.map((level) => (
              <div
                key={level}
                className={`option-card ${
                  level === gradeLevel ? "selected" : ""
                }`}
                onClick={() => handleSelectGradeLevel(level)}
              >
                {level}
              </div>
            ))}
          </div>
        </div>

        {/* Practical Focus Selection */}
        <div className="space-y-4">
          <h2 className="text-xl">
            2. Select the primary practical skill students will develop.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {practicalFocusAreas.map((focus) => (
              <div
                key={focus}
                className={`option-card ${
                  focus === practicalFocusArea ? "selected" : ""
                }`}
                onClick={() => handleSelectPracticalFocus(focus)}
              >
                {focus}
              </div>
            ))}
          </div>
        </div>

        {/* Academic Focus Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. Choose 1-2 core academic disciplines.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academicFocusOptions.map((focus) => (
              <div
                key={focus}
                className={`option-card ${
                  isAcademicFocusSelected(focus) ? "selected" : ""
                }`}
                onClick={() => handleToggleAcademicFocus(focus)}
              >
                {focus}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`button w-full max-w-xs ${
            !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
};

export default SetupStep;
