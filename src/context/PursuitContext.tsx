import React, { createContext, useContext, useReducer, useRef, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  PursuitFormState,
  SetupData,
  IdeaData,
  ConceptSummaryData,
  ConceptSummaryVersion,
  RubricScore,
} from '@/types';

// Stubbed AI responses for testing
const STUB_AI_SUMMARY = `The "Math for Daily Life" pursuit is designed to connect mathematical concepts to real-world applications for 6th-8th grade students. This interdisciplinary experience focuses on personal finance and daily living skills through practical math applications. Students will learn to create budgets, understand interest rates, calculate discounts, manage time, and measure for cooking and DIY projects. The pursuit culminates with students designing a "Life Skills Math Handbook" that documents their learning and serves as a personal reference guide.`;

const STUB_RUBRIC_SCORES: RubricScore[] = [
  { name: 'Relevance', score: 4, maxScore: 5, feedback: 'Good connection to real-world applications.' },
  { name: 'Engagement', score: 3, maxScore: 5, feedback: 'Could use more interactive elements.' },
  { name: 'Clarity', score: 5, maxScore: 5 },
  { name: 'Academic Integration', score: 4, maxScore: 5 },
  { name: 'Measurability', score: 3, maxScore: 5, feedback: 'Consider more specific success criteria.' },
];

const STUB_QUESTIONS = [
  'What specific interactive activities could make this pursuit more engaging?',
  'How will you measure student success at the end of this pursuit?',
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
    ideaText: '',
  },
  conceptSummary: {
    versions: [],
    currentVersionIndex: -1,
  },
  isLoading: false,
};

// Action types
type ActionType =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_SETUP'; payload: Partial<SetupData> }
  | { type: 'UPDATE_IDEA'; payload: string }
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'ADD_CONCEPT_VERSION'; payload: Omit<ConceptSummaryVersion, 'id'> }
  | { type: 'SET_CURRENT_VERSION'; payload: number }
  | { type: 'APPROVE_CURRENT_VERSION' }
  | { type: 'EDIT_CURRENT_VERSION'; payload: Partial<ConceptSummaryVersion> };

// Reducer
function pursuitReducer(state: PursuitFormState, action: ActionType): PursuitFormState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };

    case 'UPDATE_SETUP':
      return { ...state, setup: { ...state.setup, ...action.payload } };

    case 'UPDATE_IDEA':
      return { ...state, idea: { ...state.idea, ideaText: action.payload } };

    case 'START_LOADING':
      return { ...state, isLoading: true };

    case 'STOP_LOADING':
      return { ...state, isLoading: false };

    case 'ADD_CONCEPT_VERSION': {
      const newVersion = {
        id: uuidv4(),
        ...action.payload,
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

    case 'SET_CURRENT_VERSION':
      return {
        ...state,
        conceptSummary: {
          ...state.conceptSummary,
          currentVersionIndex: action.payload,
        },
      };

    case 'APPROVE_CURRENT_VERSION': {
      const { versions, currentVersionIndex } = state.conceptSummary;
      const updatedVersions = [...versions];
      if (updatedVersions[currentVersionIndex]) {
        updatedVersions[currentVersionIndex] = {
          ...updatedVersions[currentVersionIndex],
          approved: true,
        };
      }
      return {
        ...state,
        conceptSummary: {
          ...state.conceptSummary,
          versions: updatedVersions,
        },
      };
    }

    case 'EDIT_CURRENT_VERSION': {
      const { versions, currentVersionIndex } = state.conceptSummary;
      const updatedVersions = [...versions];
      if (updatedVersions[currentVersionIndex]) {
        updatedVersions[currentVersionIndex] = {
          ...updatedVersions[currentVersionIndex],
          ...action.payload,
        };
      }
      return {
        ...state,
        conceptSummary: {
          ...state.conceptSummary,
          versions: updatedVersions,
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
  nextStep: () => void;
  prevStep: () => void;
  updateSetup: (data: Partial<SetupData>) => void;
  updateIdea: (text: string) => void;
  submitIdea: () => void;
  getCurrentVersion: () => ConceptSummaryVersion | null;
  setCurrentVersion: (index: number) => void;
  approveCurrentVersion: () => void;
  editCurrentVersion: (data: Partial<ConceptSummaryVersion>) => void;
  answerQuestions: (answers: string[]) => void;
  scrollToNextStep: () => void;
}

const PursuitContext = createContext<PursuitContextType | undefined>(undefined);

// Provider component
export function PursuitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pursuitReducer, initialState);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const nextStep = () => {
    if (state.currentStep < 4) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
    }
  };

  const updateSetup = (data: Partial<SetupData>) => {
    dispatch({ type: 'UPDATE_SETUP', payload: data });
  };

  const updateIdea = (text: string) => {
    dispatch({ type: 'UPDATE_IDEA', payload: text });
  };

  const submitIdea = async () => {
    dispatch({ type: 'START_LOADING' });
    
    try {
      // Call our API endpoint with the idea and setup data
      const response = await fetch('/api/generate-concept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: state.idea.ideaText,
          setup: state.setup,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate concept');
      }

      const data = await response.json();
      
      // Add the concept version from the API response
      dispatch({ 
        type: 'ADD_CONCEPT_VERSION', 
        payload: {
          summary: data.summary,
          scores: data.scores,
          questions: data.questions,
        }
      });
      
      nextStep();
    } catch (error) {
      console.error('Error generating concept:', error);
      
      // Fallback to stub data if the API call fails
      dispatch({ 
        type: 'ADD_CONCEPT_VERSION', 
        payload: {
          summary: STUB_AI_SUMMARY,
          scores: STUB_RUBRIC_SCORES,
          questions: STUB_QUESTIONS,
        }
      });
    } finally {
      dispatch({ type: 'STOP_LOADING' });
    }
  };

  const getCurrentVersion = (): ConceptSummaryVersion | null => {
    const { versions, currentVersionIndex } = state.conceptSummary;
    return currentVersionIndex >= 0 && versions[currentVersionIndex] 
      ? versions[currentVersionIndex] 
      : null;
  };

  const setCurrentVersion = (index: number) => {
    dispatch({ type: 'SET_CURRENT_VERSION', payload: index });
  };

  const approveCurrentVersion = () => {
    dispatch({ type: 'APPROVE_CURRENT_VERSION' });
  };

  const editCurrentVersion = (data: Partial<ConceptSummaryVersion>) => {
    dispatch({ type: 'EDIT_CURRENT_VERSION', payload: data });
  };

  const answerQuestions = async (answers: string[]) => {
    dispatch({ type: 'START_LOADING' });
    
    const currentVersion = getCurrentVersion();
    if (!currentVersion) {
      dispatch({ type: 'STOP_LOADING' });
      return;
    }
    
    try {
      // In a real implementation, we would send the answers to the API
      // For now, we'll simulate an improved version based on answers
      
      // Create a prompt with the current summary and the user's answers
      const response = await fetch('/api/generate-concept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: state.idea.ideaText,
          setup: state.setup,
          currentSummary: currentVersion.summary,
          currentScores: currentVersion.scores,
          answers: answers,
          questions: currentVersion.questions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update concept');
      }

      const data = await response.json();
      
      // Add the updated concept version
      dispatch({ 
        type: 'ADD_CONCEPT_VERSION', 
        payload: {
          summary: data.summary,
          scores: data.scores,
          questions: data.questions,
        }
      });
    } catch (error) {
      console.error('Error updating concept:', error);
      
      // Fallback to improved stub data if the API call fails
      const improvedScores = currentVersion.scores.map(score => ({
        ...score,
        score: Math.min(score.score + 1, score.maxScore),
        feedback: score.score + 1 >= score.maxScore ? undefined : score.feedback,
      }));
      
      dispatch({ 
        type: 'ADD_CONCEPT_VERSION', 
        payload: {
          summary: currentVersion.summary + "\n\nThe pursuit now includes more interactive elements and clearer success criteria based on student performance in creating their Life Skills Math Handbook.",
          scores: improvedScores,
          questions: improvedScores.some(s => s.score < s.maxScore) ? ['Any additional thoughts on how to make this pursuit more effective?'] : [],
        }
      });
    } finally {
      dispatch({ type: 'STOP_LOADING' });
    }
  };

  const scrollToNextStep = () => {
    const nextIndex = state.currentStep;
    if (stepRefs.current[nextIndex]) {
      stepRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const contextValue: PursuitContextType = {
    state,
    nextStep,
    prevStep,
    updateSetup,
    updateIdea,
    submitIdea,
    getCurrentVersion,
    setCurrentVersion,
    approveCurrentVersion,
    editCurrentVersion,
    answerQuestions,
    scrollToNextStep,
  };

  return (
    <PursuitContext.Provider value={contextValue}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            ref: (el: HTMLDivElement) => {
              stepRefs.current[index + 1] = el;
            }
          });
        }
        return child;
      })}
    </PursuitContext.Provider>
  );
}

// Custom hook
export function usePursuit() {
  const context = useContext(PursuitContext);
  if (context === undefined) {
    throw new Error('usePursuit must be used within a PursuitProvider');
  }
  return context;
}
