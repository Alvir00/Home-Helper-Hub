import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}>
      
      {/* Background Image with Ken Burns effect */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/busy-home.png)` }}
        animate={{ scale: [1.2, 1], filter: ['blur(10px)', 'blur(2px)'] }}
        transition={{ duration: 4, ease: 'easeOut' }}
      />
      
      {/* Terracotta overlay */}
      <motion.div 
        className="absolute inset-0 z-10 bg-primary/40 mix-blend-multiply"
        animate={{ opacity: [0.6, 0.4, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Shapes simulating chaos */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <motion.div 
          className="absolute w-[40vw] h-[40vw] border-4 border-bg-light/20 rounded-full"
          animate={{ rotate: [0, 90], scale: [0.8, 1.2], x: ['-20vw', '10vw'], y: ['-10vh', '20vh'] }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute right-0 bottom-0 w-[50vw] h-[50vw] border-[10px] border-accent/30 rounded-full"
          animate={{ rotate: [0, -90], scale: [1.5, 1], x: ['10vw', '-5vw'], y: ['20vh', '-10vh'] }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-30 text-center px-10">
        <motion.h1 
          className="text-[8vw] font-display text-text-inverse leading-tight mb-4"
          initial={{ y: 50, opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Life moves fast.
        </motion.h1>
        
        <motion.p 
          className="text-[3vw] text-bg-light/90 font-light tracking-wide"
          initial={{ y: 30, opacity: 0 }}
          animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Your home shouldn't be another stress.
        </motion.p>
      </div>

    </motion.div>
  );
}
