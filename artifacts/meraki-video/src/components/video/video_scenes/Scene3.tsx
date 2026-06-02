import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-bg-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8 }}>

      {/* Accent sweep background */}
      <motion.div className="absolute top-0 left-0 bottom-0 bg-accent z-0"
        initial={{ width: 0 }}
        animate={{ width: '100vw' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div className="absolute inset-0 bg-primary z-0"
        initial={{ width: 0 }}
        animate={{ width: '100vw' }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Worker Profile Card */}
      <motion.div className="relative z-10 w-[35vw] bg-bg-light rounded-[1.5vw] shadow-2xl p-[2vw] flex flex-col items-center"
        initial={{ y: 100, opacity: 0, rotate: -5 }}
        animate={phase >= 1 ? { y: 0, opacity: 1, rotate: 0 } : { y: 100, opacity: 0, rotate: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div className="absolute -top-[3vw] bg-accent text-white px-[2vw] py-[0.5vw] rounded-full text-[1.2vw] font-bold shadow-lg"
          initial={{ scale: 0 }}
          animate={phase >= 2 ? { scale: 1 } : { scale: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          Match Found!
        </motion.div>

        <div className="w-[12vw] h-[12vw] rounded-full overflow-hidden border-4 border-white shadow-inner mb-[1vw] mt-[1vw]">
          <img src={`${import.meta.env.BASE_URL}images/worker.png`} className="w-full h-full object-cover" alt="Worker" />
        </div>

        <motion.h3 className="font-display text-[2.5vw] text-text-primary"
          initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        >
          Sara M.
        </motion.h3>
        <motion.div className="flex items-center gap-[0.5vw] text-accent mt-[0.5vw]"
          initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        >
          ★ ★ ★ ★ ★ <span className="text-text-muted text-[1vw]">(4.9)</span>
        </motion.div>
        
        <motion.p className="text-text-secondary text-[1.2vw] mt-[1.5vw] text-center"
          initial={{ opacity: 0 }} animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        >
          Arriving in <strong>30 minutes</strong>
        </motion.p>
      </motion.div>

    </motion.div>
  );
}
