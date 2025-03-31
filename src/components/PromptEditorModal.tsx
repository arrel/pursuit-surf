"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrompt } from "@/context/PromptContext";

interface PromptVersion {
  id: string;
  content: string;
  timestamp: number;
  isDefault?: boolean;
}

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
}

const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const { defaultPrompt } = usePrompt();
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [editedPrompt, setEditedPrompt] = useState(initialPrompt);

  useEffect(() => {
    // Load versions from localStorage
    const savedVersions = localStorage.getItem("promptVersions");
    if (savedVersions) {
      const parsedVersions = JSON.parse(savedVersions);
      setVersions(parsedVersions);

      // If we're showing the default prompt, always use the latest default
      if (initialPrompt === defaultPrompt) {
        setEditedPrompt(defaultPrompt);
        setCurrentVersionIndex(-1); // -1 indicates default prompt
      } else {
        // Find the version that matches the current active prompt
        const activeIndex = parsedVersions.findIndex(
          (v: PromptVersion) => v.content === initialPrompt
        );
        setCurrentVersionIndex(
          activeIndex >= 0 ? activeIndex : parsedVersions.length - 1
        );
      }
    } else {
      // Initialize with empty versions array - we don't save the default prompt
      setVersions([]);
      setCurrentVersionIndex(-1); // -1 indicates default prompt
    }
  }, [initialPrompt, defaultPrompt]);

  useEffect(() => {
    // Update edited prompt when version changes
    if (currentVersionIndex === -1) {
      // Default prompt
      setEditedPrompt(defaultPrompt);
    } else if (versions.length > 0 && currentVersionIndex >= 0) {
      setEditedPrompt(versions[currentVersionIndex].content);
    }
  }, [currentVersionIndex, versions, defaultPrompt]);

  const handleSave = () => {
    if (!editedPrompt?.trim()) return;

    // If editing the default prompt and it's unchanged, just close
    if (
      currentVersionIndex === -1 &&
      editedPrompt.trim() === defaultPrompt.trim()
    ) {
      return onClose();
    }

    // If editing an existing version and it's unchanged, just close
    if (
      currentVersionIndex >= 0 &&
      editedPrompt.trim() === versions[currentVersionIndex].content.trim()
    ) {
      return onClose();
    }

    // Don't save if it's identical to the default prompt
    if (editedPrompt.trim() === defaultPrompt.trim()) {
      // Just set the active prompt to the default
      localStorage.removeItem("activePrompt");
      onClose();
      return;
    }

    // Create a new version
    const newVersion = {
      id: Date.now().toString(),
      content: editedPrompt,
      timestamp: Date.now(),
    };

    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    setCurrentVersionIndex(updatedVersions.length - 1);

    // Save to localStorage
    localStorage.setItem("promptVersions", JSON.stringify(updatedVersions));
    localStorage.setItem("activePrompt", editedPrompt);

    onClose();
  };

  const handleSwitchVersion = (index: number) => {
    setCurrentVersionIndex(index);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full mb-4">
          <h2 className="text-2xl">AI Prompt</h2>
          <button
            className="text-3xl text-primer-black-light hover:text-primer-black focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              key="default"
              className={`px-3 py-1 rounded-full text-sm ${
                currentVersionIndex === -1
                  ? "bg-primer-purple text-white"
                  : "bg-primer-gray-light text-primer-black-light"
              }`}
              onClick={() => handleSwitchVersion(-1)}
            >
              Default
            </button>
            {versions.map((version, index) => (
              <button
                key={version.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  index === currentVersionIndex
                    ? "bg-primer-purple text-white"
                    : "bg-primer-gray-light text-primer-black-light"
                }`}
                onClick={() => handleSwitchVersion(index)}
              >
                V{index + 1}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full h-96 p-4 bg-primer-gray-light text-primer-black rounded-md mb-4 font-mono text-sm"
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
        />

        <div className="flex justify-end gap-4">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" onClick={handleSave}>
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PromptEditorModal;
