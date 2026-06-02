import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}>
      
      {/* Background splits and reveals cream */}
      <motion.div className="absolute inset-0 bg-bg-light z-0" />

      {/* Geometric background elements */}
      <motion.div className="absolute w-[80vw] h-[80vw] rounded-full bg-bg-muted -right-[20vw] -top-[20vw] z-0" 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 w-full max-w-[25vw] aspect-[9/19] bg-white rounded-[2vw] shadow-2xl border-8 border-bg-muted flex flex-col items-center py-8 px-4 overflow-hidden">
        
        {/* App Header */}
        <motion.div 
          className="w-full text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-primary text-[2.5vw]">meraki</h2>
          <p className="text-[0.8vw] text-text-muted">Home Help, On Demand</p>
        </motion.div>

        {/* UI Elements */}
        <div className="flex-1 w-full flex flex-col justify-center gap-4 mt-8">
          <motion.div 
            className="w-full h-[4vw] bg-bg-muted rounded-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={phase >= 2 ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div 
            className="w-full h-[4vw] bg-bg-muted rounded-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={phase >= 2 ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
        </div>

        {/* CTA Button */}
        <motion.div 
          className="w-full bg-primary text-text-inverse py-[1vw] rounded-full text-center text-[1.2vw] font-medium shadow-lg mt-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={
            phase === 4 ? { scale: 0.95, backgroundColor: 'var(--color-accent)' } :
            phase >= 3 ? { y: 0, opacity: 1, scale: 1, backgroundColor: 'var(--color-primary)' } : 
            { y: 50, opacity: 0 }
          }
          transition={{ duration: 0.4 }}
        >
          Book Cleaner
        </motion.div>

        {/* Pointer click simulation */}
        <motion.div 
          className="absolute w-[2vw] h-[2vw] rounded-full bg-text-primary/20 backdrop-blur-sm z-20 pointer-events-none"
          initial={{ x: '10vw', y: '20vh', opacity: 0 }}
          animate={
            phase >= 4 ? { x: 0, y: '32vh', opacity: [0, 1, 0], scale: [1, 0.8, 1.2] } :
            { opacity: 0 }
          }
          transition={{ duration: 0.6 }}
        />
      </div>

    </motion.div>
  );
}
