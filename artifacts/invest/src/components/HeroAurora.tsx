import { motion } from "framer-motion";

/**
 * Layered, on-brand hero background: animated radial gradients +
 * conic aurora + grid + slow drifting orb. Lives behind the hero copy.
 */
export default function HeroAurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 portal-grid" aria-hidden />
      <motion.div
        className="absolute inset-0 portal-aurora"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        aria-hidden
      />
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,245,212,0.22) 0%, rgba(0,245,212,0) 60%)",
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        aria-hidden
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0) 65%)",
        }}
        animate={{ x: [0, 60, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 24, ease: "easeInOut", repeat: Infinity }}
        aria-hidden
      />
      <motion.div
        className="absolute -bottom-24 right-0 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 65%)",
        }}
        animate={{ x: [0, -40, 30, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/30 to-[#0A0A0A]" />
    </div>
  );
}
