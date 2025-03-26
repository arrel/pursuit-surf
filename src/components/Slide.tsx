import React, { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SlideProps {
  children: ReactNode;
  id: string;
  className?: string;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(
  ({ children, id, className = '' }, ref) => {
    return (
      <section 
        id={id} 
        ref={ref} 
        className={`slide ${className}`}
      >
        <motion.div
          className="slide-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {children}
        </motion.div>
      </section>
    );
  }
);

Slide.displayName = 'Slide';

export default Slide;
