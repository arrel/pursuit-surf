import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePursuit } from "@/context/PursuitContext";
import { useRouter } from "next/navigation";

const IdeaStep: React.FC = () => {
  const { state, updateIdea, submitIdea } = usePursuit();
  const { ideaText } = state.idea;
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null
  );

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recordingStream]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateIdea(e.target.value);
  };

  const startRecording = async () => {
    try {
      // Check if browser supports speech recognition
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        alert(
          "Your browser does not support speech recognition. Try using Chrome or Edge."
        );
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecordingStream(stream);
      setIsRecording(true);

      // Use the Web Speech API
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = ideaText;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += " " + transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the text area with the transcribed text
        updateIdea(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        stopRecording(recognition);
      };

      recognition.onend = () => {
        // Only update if we're still recording (to avoid overwriting if manually stopped)
        if (isRecording) {
          updateIdea(finalTranscript);
          stopRecording(recognition);
        }
      };

      recognition.start();

      // Store the recognition instance to stop it later
      (window as any).currentRecognition = recognition;
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check your permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = (recognition?: any) => {
    setIsRecording(false);

    // Stop the speech recognition if it exists
    if (recognition) {
      recognition.stop();
    } else if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
      delete (window as any).currentRecognition;
    }

    // Stop all audio tracks
    if (recordingStream) {
      recordingStream.getTracks().forEach((track) => track.stop());
      setRecordingStream(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async () => {
    if (ideaText.trim().length > 0) {
      setIsSubmitting(true);
      await submitIdea();
      setIsSubmitting(false);
      // Navigate to the concept confirmation step
      router.push("/step/3");
    }
  };

  const handlePrevious = () => {
    // Navigate to the previous step using the router
    router.push("/step/1");
  };

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-4xl font-bold text-primer-purple-light">
        Share your pursuit idea
      </h1>
      <p className="text-xl mb-4">
        Use this space to describe your entire pursuit concept in your own
        words. Don't worry about organization or structure - just get all your
        thoughts out there. We'll help you refine it in the next step.
      </p>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label htmlFor="idea-input" className="text-xl font-semibold">
            Your Pursuit Idea
          </label>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`button-secondary flex items-center text-sm px-3 py-2 ${
              isRecording ? "bg-red-500 hover:bg-red-600" : ""
            }`}
            onClick={toggleRecording}
            disabled={isSubmitting}
          >
            <span className="mr-2">{isRecording ? "⏹️" : "🎤"}</span>
            {isRecording ? "Stop Recording" : "Audio to Text"}
          </motion.button>
        </div>

        <textarea
          id="idea-input"
          className="input-field w-full h-64 resize-none"
          placeholder="What are the goals? What will students do? What makes it engaging? How will it connect to real-world applications?"
          value={ideaText}
          onChange={handleTextChange}
          disabled={isSubmitting}
        ></textarea>

        <div className="text-sm text-gray-400">
          Tip: The more details you provide, the better we can help you refine
          your idea!
        </div>
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
            !ideaText.trim() || isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={handleSubmit}
          disabled={!ideaText.trim() || isSubmitting}
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
              Analyzing your idea...
            </span>
          ) : (
            "Next"
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default IdeaStep;
