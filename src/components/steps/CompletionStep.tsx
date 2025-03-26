import React from 'react';
import { motion } from 'framer-motion';

const CompletionStep: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-primer-purple to-primer-purple-dark flex items-center justify-center"
      >
        <span className="text-6xl">🎉</span>
      </motion.div>
      
      <h1 className="text-4xl font-bold text-primer-purple-light">You're Done!</h1>
      
      <div className="max-w-2xl">
        <p className="text-xl mb-6">
          Congratulations! You've successfully designed your Primer Pursuit.
        </p>
        <p className="text-lg text-gray-300 mb-8">
          Feel free to scroll back up through the previous steps to review or edit your work.
        </p>
      </div>
      
      <motion.a
        href="#step-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="button-secondary mt-4"
      >
        Back to Start
      </motion.a>
    </div>
  );
};

export default CompletionStep;
