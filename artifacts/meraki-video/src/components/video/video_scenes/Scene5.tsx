import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-bg-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}>

      {/* Subtle animated background gradient */}
      <motion.div 
        className="absolute inset-0 opacity-40 z-0"
        style={{ background: 'radial-gradient(circle at 50% 50%, var(--color-bg-muted), transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.h1 className="font-display text-primary text-[12vw] tracking-tighter leading-none"
          initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
          animate={phase >= 1 ? { scale: 1, opacity: 1, filter: 'blur(0px)' } : { scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          meraki
        </motion.h1>
        
        <motion.p className="text-text-secondary text-[2vw] mt-[2vw] tracking-widest uppercase font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Your home, perfectly kept.
        </motion.p>
      </div>

    </motion.div>
  );
}
