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
} from "@/types";
import { usePrompt } from "./PromptContext";

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
  | { type: "ADD_CONCEPT_VERSION"; payload: Partial<ConceptSummaryVersion> }
  | { type: "SET_CURRENT_VERSION"; payload: number }
  | { type: "APPROVE_CURRENT_VERSION" }
  | { type: "EDIT_CURRENT_VERSION"; payload: Partial<ConceptSummaryVersion> }
  | { type: "RESET_FORM" };

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
        conceptSummary: "", // Default empty string for required field
        scores: [], // Default empty array for required field
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

      // A version is considered approved when all scores are 4 (max score)
      const approvedVersions = state.conceptSummary.versions;

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

    case "RESET_FORM":
      return initialState;

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
  const { prompt } = usePrompt();

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
        body: JSON.stringify({ idea, prompt }),
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

      // Create the first version with the feedback data
      dispatch({
        type: "ADD_CONCEPT_VERSION",
        payload: data,
      });

      // Navigation is handled by the component
    } catch (error) {
      // TODO: Handle error
      console.error("Error submitting idea:", error);
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  }, [
    state.setup.gradeLevel,
    state.setup.practicalFocusArea,
    state.setup.academicFocuses,
    state.idea.ideaText,
    prompt,
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
          ].conceptSummary,
          "Q&A:",
          answers
            .filter((a) => a.answer?.trim())
            .map((a) => `${a.question}: ${a.answer}`)
            .join("\n"),
        ].join("\n");

        // Create a prompt with the current summary and the user's answers
        const response = await fetch("/api/generate-concept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idea, prompt }),
        });

        if (!response.ok) {
          throw new Error("Failed to update concept");
        }

        const data = await response.json();

        // Add the updated concept version
        dispatch({
          type: "ADD_CONCEPT_VERSION",
          payload: data,
        });
      } catch (error) {
        console.error("Error updating concept:", error);
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
      prompt,
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
          body: JSON.stringify({ idea, prompt }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate concept feedback");
        }

        const data = await response.json();

        // Add the new version with the updated structure
        dispatch({
          type: "ADD_CONCEPT_VERSION",
          payload: data,
        });

        // Navigation is handled by the component
      } catch (error) {
        console.error("Error submitting concept confirmation:", error);
      } finally {
        dispatch({ type: "STOP_LOADING" });
      }
    },
    [
      state.setup.gradeLevel,
      state.setup.practicalFocusArea,
      state.setup.academicFocuses,
      prompt,
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
