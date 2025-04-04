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
  criterion: string;
  score: number;
  feedback?: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface QuestionReason {
  question: string;
  criterion: string;
  reason: string;
}

export interface ConceptSummaryVersion {
  id: string;
  conceptSummary: string;
  strengths?: string;
  areasForImprovement?: string;
  suggestions?: string;
  scores: RubricScore[];
  questions?: QuestionReason[];
}

export interface ConceptSummaryData {
  versions: ConceptSummaryVersion[];
  currentVersionIndex: number;
  approvedVersion: ConceptSummaryVersion | null;
  initialConcept: string | null;
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
  conceptSummary: string;
  strengths: string;
  areasForImprovement: string;
  suggestions: string;
  scores: {
    criterion: string;
    score: number;
    feedback: string;
  }[];
  questions: {
    question: string;
    reason: string;
  }[];
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
