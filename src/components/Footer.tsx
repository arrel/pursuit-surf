"use client";

import React, { useState } from "react";
import PromptEditorModal from "./PromptEditorModal";
import { usePrompt } from "@/context/PromptContext";

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { prompt } = usePrompt();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <footer className="py-4 px-6 mt-auto">
      <div className="flex justify-end">
        <button 
          onClick={openModal}
          className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
        >
          View Prompt
        </button>
      </div>
      <PromptEditorModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        initialPrompt={prompt}
      />
    </footer>
  );
};

export default Footer;
