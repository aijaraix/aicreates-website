import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-xl">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#00F5D4] mb-6">404 · Off the layer</div>
        <h1 className="text-5xl md:text-7xl font-serif font-semibold text-gradient leading-[1.05] mb-6">
          Nothing here.
        </h1>
        <p className="text-white/55 mb-10">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
            Back to home <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
