import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1.2 }}>

      {/* Calm home image background */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/calm-home.png)` }}
        animate={{ scale: [1, 1.1], y: [0, -20] }}
        transition={{ duration: 6, ease: 'linear' }}
      />
      
      {/* Light warm wash */}
      <div className="absolute inset-0 z-10 bg-bg-light/30 backdrop-blur-[2px]" />
      
      <div className="relative z-20 text-center px-10 max-w-[80vw]">
        <motion.h2 className="font-display text-[6vw] text-text-primary mb-[2vw] leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Breathe easy.
        </motion.h2>
        <motion.div className="h-[2px] bg-primary mx-auto"
          initial={{ width: 0 }}
          animate={phase >= 2 ? { width: '15vw' } : { width: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.p className="text-[2.5vw] text-text-secondary mt-[2vw] font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1 }}
        >
          Trusted professionals handling the details.
        </motion.p>
      </div>

    </motion.div>
  );
}
