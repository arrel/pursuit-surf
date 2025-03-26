// Common types for our application

export type GradeLevel = "K-2nd" | "3rd-5th" | "6th-8th";

export type PracticalFocusArea =
  | "💬 Communication"
  | "🧠 Critical Thinking"
  | "🏠 Daily Living"
  | "🔄 Feedback"
  | "💵 Personal Finance"
  | "🎤 Public Speaking"
  | "🪴 Self-Care"
  | "✍🏻 Writing";

export type AcademicFocus =
  | "🎭 Arts"
  | "🤖 Computer Science"
  | "📐 Math"
  | "📚 Reading"
  | "🔬 Science"
  | "🏛️ Social Studies";

export interface SetupData {
  gradeLevel: GradeLevel | null;
  practicalFocusArea: PracticalFocusArea | null;
  academicFocuses: AcademicFocus[];
}

export interface IdeaData {
  ideaText: string;
}

export interface RubricScore {
  name: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface ConceptSummaryVersion {
  id: string;
  summary: string;
  scores: RubricScore[];
  questions?: string[];
  approved?: boolean;
}

export interface ConceptSummaryData {
  versions: ConceptSummaryVersion[];
  currentVersionIndex: number;
}

export interface PursuitFormState {
  currentStep: number;
  setup: SetupData;
  idea: IdeaData;
  conceptSummary: ConceptSummaryData;
  isLoading: boolean;
}

// Define the structure of the response we expect from OpenAI
export interface ConceptResponse {
  summary: string;
  strengths: string[];
  improvements: string[];
  scores: {
    name: string;
    score: number;
    maxScore: number;
    feedback?: string;
  }[];
  questions: string[];
}

// Web Speech API TypeScript declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  class SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
  }

  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
}
