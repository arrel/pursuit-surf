import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const IntroStep: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/step/1');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold text-primer-purple-light mb-8">
          Welcome to the Pursuit Builder!
        </h1>
        <p className="text-xl mb-12">
          You're about to design an engaging learning experience that helps students develop 
          real-world, practical skills they'll use for life.
        </p>
      </div>

      <div className="pt-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="button w-full max-w-xs"
          onClick={handleGetStarted}
        >
          Let's get started
        </motion.button>
      </div>
    </div>
  );
};

export default IntroStep;
