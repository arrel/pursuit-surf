import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  SetupData,
  IdeaData,
  ConceptSummaryData,
  PursuitFormState,
  ConceptSummaryVersion,
  RubricScore,
  QuestionAnswer,
  QuestionReason,
  ConceptFeedback,
} from "@/types";

// Stubbed AI responses for testing
const STUB_AI_SUMMARY = `The "Math for Daily Life" pursuit is designed to connect mathematical concepts to real-world applications for 6th-8th grade students. This interdisciplinary experience focuses on personal finance and daily living skills through practical math applications. Students will learn to create budgets, understand interest rates, calculate discounts, manage time, and measure for cooking and DIY projects. The pursuit culminates with students designing a "Life Skills Math Handbook" that documents their learning and serves as a personal reference guide.`;

const STUB_RUBRIC_SCORES: RubricScore[] = [
  {
    name: "Relevance",
    score: 4,
    maxScore: 5,
    feedback: "Good connection to real-world applications.",
  },
  {
    name: "Engagement",
    score: 3,
    maxScore: 5,
    feedback: "Could use more interactive elements.",
  },
  { name: "Clarity", score: 5, maxScore: 5 },
  { name: "Academic Integration", score: 4, maxScore: 5 },
  {
    name: "Measurability",
    score: 3,
    maxScore: 5,
    feedback: "Consider more specific success criteria.",
  },
];

const STUB_QUESTIONS = [
  "What specific interactive activities could make this pursuit more engaging?",
  "How will you measure student success at the end of this pursuit?",
];

// Initial state
const initialState: PursuitFormState = {
  currentStep: 1,
  setup: {
    gradeLevel: null,
    practicalFocusArea: null,
    academicFocuses: [],
  },
  idea: {
    ideaText: "",
  },
  conceptSummary: {
    versions: [],
    currentVersionIndex: -1,
    approvedVersion: null,
    initialConcept: null,
    initialFeedback: null,
  },
  isLoading: false,
};

// Action types
type ActionType =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "START_LOADING" }
  | { type: "STOP_LOADING" }
  | { type: "UPDATE_SETUP"; payload: Partial<SetupData> }
  | { type: "COMPLETE_SETUP" }
  | { type: "UPDATE_IDEA"; payload: string }
  | { type: "SET_INITIAL_CONCEPT"; payload: string }
  | { type: "SET_CONCEPT_FEEDBACK"; payload: ConceptFeedback }
  | { type: "ADD_CONCEPT_VERSION"; payload: Partial<ConceptSummaryVersion> }
  | { type: "SET_CURRENT_VERSION"; payload: number }
  | { type: "APPROVE_CURRENT_VERSION" }
  | { type: "EDIT_CURRENT_VERSION"; payload: Partial<ConceptSummaryVersion> }
  | { type: "RESET_FORM" }
  | { type: "ANSWER_QUESTIONS"; payload: QuestionAnswer[] };

// Reducer
function pursuitReducer(
  state: PursuitFormState,
  action: ActionType
): PursuitFormState {
  switch (action.type) {
    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "START_LOADING":
      return {
        ...state,
        isLoading: true,
      };

    case "STOP_LOADING":
      return {
        ...state,
        isLoading: false,
      };

    case "UPDATE_SETUP":
      return {
        ...state,
        setup: {
          ...state.setup,
          ...action.payload,
        },
      };

    case "COMPLETE_SETUP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep, 2),
      };

    case "UPDATE_IDEA":
      return {
        ...state,
        idea: {
          ...state.idea,
          ideaText: action.payload,
        },
      };

    case "ADD_CONCEPT_VERSION": {
      // Ensure required fields are present
      const newVersionData = {
        summary: "",  // Default empty string for required field
        scores: [],   // Default empty array for required field
        ...action.payload,
      };

      const newVersion: ConceptSummaryVersion = {
        id: uuidv4(),
        ...newVersionData,
      };

      const updatedVersions = [...state.conceptSummary.versions, newVersion];
      const newVersionIndex = updatedVersions.length - 1;

      return {
        ...state,
        currentStep: Math.max(state.currentStep, 3),
        conceptSummary: {
          ...state.conceptSummary,
          versions: updatedVersions,
          currentVersionIndex: newVersionIndex,
          approvedVersion: updatedVersions[newVersionIndex],
        },
      };
    }

    case "SET_CURRENT_VERSION": {
      return {
        ...state,
        conceptSummary: {
          ...state.conceptSummary,
          currentVersionIndex: action.payload,
        },
      };
    }

    case "APPROVE_CURRENT_VERSION": {
      const versionIndex = state.conceptSummary.currentVersionIndex;
      const versionToApprove = state.conceptSummary.versions[versionIndex];

      if (!versionToApprove) {
        return state;
      }

      const approvedVersions = state.conceptSummary.versions.map(
        (version, index) => {
          if (index === versionIndex) {
            return { ...version, approved: true };
          }
          return version;
        }
      );

      return {
        ...state,
        currentStep: Math.max(state.currentStep, 4),
        conceptSummary: {
          ...state.conceptSummary,
          versions: approvedVersions,
          approvedVersion: approvedVersions[versionIndex],
        },
      };
    }

    case "EDIT_CURRENT_VERSION": {
      const editVersionIndex = state.conceptSummary.currentVersionIndex;
      if (editVersionIndex < 0) {
        return state;
      }

      const editedVersions = state.conceptSummary.versions.map(
        (version, index) => {
          if (index === editVersionIndex) {
            return { ...version, ...action.payload };
          }
          return version;
        }
      );

      return {
        ...state,
        conceptSummary: {
          ...state.conceptSummary,
          versions: editedVersions,
        },
      };
    }

    case "SET_INITIAL_CONCEPT":
      return {
        ...state,
        currentStep: Math.max(state.currentStep, 3),
        conceptSummary: {
          ...state.conceptSummary,
          initialConcept: action.payload,
        },
      };

    case "SET_CONCEPT_FEEDBACK":
      return {
        ...state,
        conceptSummary: {
          ...state.conceptSummary,
          initialFeedback: action.payload,
        },
      };

    case "RESET_FORM":
      return initialState;

    case "ANSWER_QUESTIONS": {
      const currentVersion =
        state.conceptSummary.versions[state.conceptSummary.currentVersionIndex];
      if (!currentVersion) return state;

      const improvedScores = currentVersion.scores.map((score) => ({
        ...score,
        score: Math.min(score.score + 1, score.maxScore),
        feedback:
          score.score + 1 >= score.maxScore ? undefined : score.feedback,
      }));

      const newVersion = {
        id: uuidv4(),
        summary:
          currentVersion.summary +
          "\n\nThe pursuit now includes more interactive elements and clearer success criteria based on student performance in creating their Life Skills Math Handbook.",
        scores: improvedScores,
        questions: improvedScores.some((s) => s.score < s.maxScore)
          ? [
              {
                question:
                  "Any additional thoughts on how to make this pursuit more effective?",
                reason: "Your insights can help refine the pursuit further.",
              },
            ]
          : [],
      };

      const newVersions = [...state.conceptSummary.versions, newVersion];
      return {
        ...state,
        conceptSummary: {
          ...state.conceptSummary,
          versions: newVersions,
          currentVersionIndex: newVersions.length - 1,
        },
      };
    }

    default:
      return state;
  }
}

// Context
interface PursuitContextType {
  state: PursuitFormState;
  setCurrentStep: (step: number) => void;
  completeSetup: () => void;
  updateSetup: (data: Partial<SetupData>) => void;
  updateIdea: (text: string) => void;
  submitIdea: () => Promise<void>;
  getCurrentVersion: () => ConceptSummaryVersion | null;
  setCurrentVersion: (index: number) => void;
  approveCurrentVersion: () => void;
  editCurrentVersion: (data: Partial<ConceptSummaryVersion>) => void;
  answerQuestions: (answers: QuestionAnswer[]) => Promise<void>;
  resetForm: () => void;
  submitConceptConfirmation: (summary: string) => Promise<void>;
}

const PursuitContext = createContext<PursuitContextType | undefined>(undefined);

// Provider component
export function PursuitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pursuitReducer, initialState);

  const setCurrentStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      dispatch({ type: "SET_CURRENT_STEP", payload: step });
    }
  }, []);

  const updateSetup = useCallback((data: Partial<SetupData>) => {
    dispatch({ type: "UPDATE_SETUP", payload: data });
  }, []);

  const updateIdea = useCallback((text: string) => {
    dispatch({ type: "UPDATE_IDEA", payload: text });
  }, []);

  const completeSetup = useCallback(() => {
    if (state.currentStep != 2) {
      dispatch({ type: "SET_CURRENT_STEP", payload: 2 });
    }
  }, [state.currentStep]);

  const submitIdea = useCallback(async () => {
    dispatch({ type: "START_LOADING" });

    try {
      // Combine the data on the frontend
      const idea = [
        `Grade levels: ${state.setup.gradeLevel}`,
        `Practical focus: ${state.setup.practicalFocusArea}`,
        `Academic focus: ${state.setup.academicFocuses.join(", ")}`,
        "Freeform idea:",
        state.idea.ideaText,
      ].join("\n");

      const response = await fetch("/api/generate-concept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate concept");
      }

      const data = await response.json();

      // Set the initial concept
      dispatch({
        type: "SET_INITIAL_CONCEPT",
        payload: data.conceptSummary,
      });

      // Also store the full feedback data for later use
      dispatch({
        type: "SET_CONCEPT_FEEDBACK",
        payload: {
          strengths: data.strengths,
          areasForImprovement: data.areasForImprovement,
          suggestions: data.suggestions,
          scores: data.scores.map((score: any) => ({
            name: score.criterion,
            score: score.score,
            maxScore: 4,
            feedback: score.feedback,
          })),
          questions: data.questions,
        },
      });

      // Navigation is handled by the component
    } catch (error) {
      console.error("Error submitting idea:", error);
      // Set a fallback initial concept if the API call fails
      dispatch({
        type: "SET_INITIAL_CONCEPT",
        payload: `A pursuit focused on ${state.setup.practicalFocusArea} for ${state.setup.gradeLevel} students, incorporating ${state.setup.academicFocuses.join(", ")} and based on the idea: ${state.idea.ideaText}`,
      });

      // Also set fallback feedback data
      dispatch({
        type: "SET_CONCEPT_FEEDBACK",
        payload: {
          strengths: "- Addresses the specified academic and practical focuses\n- Shows potential for student engagement",
          areasForImprovement: "- Consider adding more detail about implementation\n- Think about assessment strategies",
          suggestions: "- Add specific activities or projects\n- Consider how to measure student progress",
          scores: [
            {
              name: "Clarity",
              score: 2,
              maxScore: 4,
              feedback: "The concept needs more specific details.",
            },
            {
              name: "Academic Integration",
              score: 2,
              maxScore: 4,
              feedback: "Academic focuses need to be more explicitly integrated.",
            },
            {
              name: "Practical Application",
              score: 2,
              maxScore: 4,
              feedback: "Consider adding more real-world connections.",
            },
          ],
          questions: [
            {
              question: "How will students demonstrate their learning in this pursuit?",
              reason: "Clear assessment criteria will help track student progress.",
            },
            {
              question: "What specific activities or projects will students complete?",
              reason: "Concrete activities will help bring the concept to life.",
            },
          ],
        },
      });
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  }, [
    state.setup.gradeLevel,
    state.setup.practicalFocusArea,
    state.setup.academicFocuses,
    state.idea.ideaText,
  ]);

  const getCurrentVersion = useCallback((): ConceptSummaryVersion | null => {
    const { versions, currentVersionIndex } = state.conceptSummary;
    return currentVersionIndex >= 0 && versions[currentVersionIndex]
      ? versions[currentVersionIndex]
      : null;
  }, [state.conceptSummary]);

  const setCurrentVersion = useCallback((index: number) => {
    dispatch({ type: "SET_CURRENT_VERSION", payload: index });
  }, []);

  const approveCurrentVersion = useCallback(() => {
    dispatch({ type: "APPROVE_CURRENT_VERSION" });
  }, []);

  const editCurrentVersion = useCallback(
    (data: Partial<ConceptSummaryVersion>) => {
      dispatch({ type: "EDIT_CURRENT_VERSION", payload: data });
    },
    []
  );

  const answerQuestions = useCallback(
    async (answers: QuestionAnswer[]) => {
      dispatch({ type: "START_LOADING" });

      const currentVersion = getCurrentVersion();
      if (!currentVersion) {
        dispatch({ type: "STOP_LOADING" });
        return;
      }

      try {
        // Combine the data on the frontend
        const idea = [
          `Grade levels: ${state.setup.gradeLevel}`,
          `Practical focus: ${state.setup.practicalFocusArea}`,
          `Academic focus: ${state.setup.academicFocuses.join(", ")}`,
          "Concept Summary:",
          state.conceptSummary.versions[
            state.conceptSummary.currentVersionIndex
          ].summary,
          "Q&A:",
          answers.map((a) => `${a.question}: ${a.answer}`),
        ].join("\n");

        // Create a prompt with the current summary and the user's answers
        const response = await fetch("/api/generate-concept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idea }),
        });

        if (!response.ok) {
          throw new Error("Failed to update concept");
        }

        const data = await response.json();

        // Convert the new response format to the expected format for our state
        const formattedScores = data.scores.map(
          (scoreItem: {
            criterion: string;
            score: number;
            strengths: string | null;
            areas_for_improvement: string | null;
            question: string | null;
          }) => {
            return {
              name: scoreItem.criterion || "Unnamed Criterion",
              score: scoreItem.score,
              maxScore: 4, // Based on the rubric in the prompt
              feedback: scoreItem.areas_for_improvement || "",
            };
          }
        );

        // Extract questions from scores where score < 4 and question exists
        const questions = data.scores
          .filter(
            (item: { score: number; question: string | null }) =>
              item.score < 4 && item.question
          )
          .map((item: { question: string | null }) => item.question)
          .filter(Boolean) as string[];

        // Determine if we should show more questions based on scores
        const allPerfectScores = formattedScores.every(
          (score: { score: number; maxScore: number }) =>
            score.score === score.maxScore
        );

        // Add the updated concept version
        dispatch({
          type: "ADD_CONCEPT_VERSION",
          payload: {
            summary: data.summary || currentVersion.summary,
            strengths: data.strengths || currentVersion.strengths,
            areasForImprovement:
              data.areasForImprovement || currentVersion.areasForImprovement,
            suggestions: data.suggestions || currentVersion.suggestions,
            scores: formattedScores,
            questions:
              !allPerfectScores && questions.length > 0
                ? questions.map((q) => ({
                    question: q,
                    reason:
                      "Answering this will help improve your pursuit concept.",
                  }))
                : [],
          },
        });
      } catch (error) {
        console.error("Error updating concept:", error);

        // Fallback to improved stub data if the API call fails
        const improvedScores = currentVersion.scores.map((score) => ({
          ...score,
          score: Math.min(score.score + 1, score.maxScore),
          feedback:
            score.score + 1 >= score.maxScore ? undefined : score.feedback,
        }));

        const allPerfectScores = improvedScores.every(
          (score: { score: number; maxScore: number }) =>
            score.score === score.maxScore
        );

        dispatch({
          type: "ADD_CONCEPT_VERSION",
          payload: {
            summary:
              currentVersion.summary +
              "\n\nThe pursuit now includes more interactive elements and clearer success criteria based on your feedback.",
            strengths: currentVersion.strengths
              ? currentVersion.strengths +
                "\n- Incorporates student feedback effectively"
              : "- Engaging and interactive\n- Incorporates student feedback effectively",
            areasForImprovement: allPerfectScores
              ? undefined
              : currentVersion.areasForImprovement,
            suggestions: currentVersion.suggestions,
            scores: improvedScores,
            questions: !allPerfectScores
              ? [
                  {
                    question:
                      "Any additional thoughts on how to make this pursuit more effective?",
                    reason:
                      "Your insights can help refine the pursuit further.",
                  },
                ]
              : [],
          },
        });
      } finally {
        dispatch({ type: "STOP_LOADING" });
      }
    },
    [
      getCurrentVersion,
      state.setup.gradeLevel,
      state.setup.practicalFocusArea,
      state.setup.academicFocuses,
      state.conceptSummary.versions,
      state.conceptSummary.currentVersionIndex,
    ]
  );

  const submitConceptConfirmation = useCallback(
    async (summary: string) => {
      dispatch({ type: "START_LOADING" });

      try {
        // Combine the data on the frontend
        const idea = [
          `Grade levels: ${state.setup.gradeLevel}`,
          `Practical focus: ${state.setup.practicalFocusArea}`,
          `Academic focus: ${state.setup.academicFocuses.join(", ")}`,
          "Concept Summary:",
          summary,
        ].join("\n");

        const response = await fetch("/api/generate-concept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate concept feedback");
        }

        const data = await response.json();

        // Add the new version with the updated structure
        dispatch({
          type: "ADD_CONCEPT_VERSION",
          payload: {
            summary: data.conceptSummary,
            strengths: data.strengths,
            areasForImprovement: data.areasForImprovement,
            suggestions: data.suggestions,
            scores: data.scores.map((score: any) => ({
              name: score.criterion,
              score: score.score,
              maxScore: 4,
              feedback: score.feedback,
            })),
            questions: data.questions,
            approved: false,
          },
        });

        // Navigation is handled by the component
      } catch (error) {
        console.error("Error submitting concept confirmation:", error);
        // Fallback to a basic version if API fails
        dispatch({
          type: "ADD_CONCEPT_VERSION",
          payload: {
            summary: summary,
            strengths:
              "- Clearly defined concept\n- Addresses the specified academic and practical focuses",
            areasForImprovement:
              "- Consider adding more detail about implementation\n- Think about assessment strategies",
            suggestions:
              "- Add specific activities or projects\n- Consider how to measure student progress",
            scores: [
              {
                name: "Clarity",
                score: 3,
                maxScore: 4,
                feedback:
                  "The concept is clear but could use more specific details.",
              },
              {
                name: "Academic Integration",
                score: 3,
                maxScore: 4,
                feedback:
                  "Good integration of academic focuses, but could be more explicit.",
              },
              {
                name: "Practical Application",
                score: 3,
                maxScore: 4,
                feedback:
                  "Strong practical focus, but consider real-world connections.",
              },
            ],
            questions: [
              {
                question:
                  "How will you assess student learning throughout this pursuit?",
                reason:
                  "Clear assessment criteria will help track student progress.",
              },
              {
                question:
                  "What specific activities or projects will students complete?",
                reason:
                  "Concrete activities will help bring the concept to life.",
              },
            ],
            approved: false,
          },
        });
      } finally {
        dispatch({ type: "STOP_LOADING" });
      }
    },
    [
      state.setup.gradeLevel,
      state.setup.practicalFocusArea,
      state.setup.academicFocuses,
    ]
  );

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, []);

  const contextValue: PursuitContextType = {
    state,
    setCurrentStep,
    completeSetup,
    updateSetup,
    updateIdea,
    submitIdea,
    getCurrentVersion,
    setCurrentVersion,
    approveCurrentVersion,
    editCurrentVersion,
    answerQuestions,
    resetForm,
    submitConceptConfirmation,
  };

  return (
    <PursuitContext.Provider value={contextValue}>
      {children}
    </PursuitContext.Provider>
  );
}

// Custom hook
export function usePursuit() {
  const context = useContext(PursuitContext);
  if (context === undefined) {
    throw new Error("usePursuit must be used within a PursuitProvider");
  }
  return context;
}
