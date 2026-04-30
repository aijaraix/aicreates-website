import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,86,207,0.1),transparent_50%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 p-8 glass-card border-white/10 max-w-md mx-4"
      >
        <div className="text-primary font-serif font-bold text-6xl mb-4">404</div>
        <h1 className="text-2xl font-serif font-bold text-white mb-4">System Not Found</h1>
        <p className="text-white/60 mb-8 leading-relaxed">
          The requested coordinate does not exist in our current architecture. Return to the core node.
        </p>
        <Link href="/">
          <Button variant="outline" className="rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 h-12 px-8">
            Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
