import { Link } from "wouter";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-background relative overflow-hidden border-t border-white/5 pt-24 pb-12">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-600" />
              <span className="font-sans font-extrabold text-xl text-white tracking-tight">
                <span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">AI</span>
                <span className="font-medium">creates</span>
                <span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm mb-6 max-w-xs">
              Building agentic AI systems, intelligent business infrastructure, and next-generation digital products.
            </p>
            <div className="flex gap-4">
              <a
                href="https://x.com/theaicreatesai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AIcreatesAI on X"
                className="text-white/40 hover:text-white transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/technology"><span className="text-sm text-white/60 hover:text-primary transition-colors cursor-pointer">Technology</span></Link></li>
              <li><Link href="/products"><span className="text-sm text-white/60 hover:text-primary transition-colors cursor-pointer">Products</span></Link></li>
              <li><Link href="/products/fin"><span className="text-sm text-white/60 hover:text-primary transition-colors cursor-pointer">Fin</span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about"><span className="text-sm text-white/60 hover:text-primary transition-colors cursor-pointer">About</span></Link></li>
              <li><Link href="/services"><span className="text-sm text-white/60 hover:text-primary transition-colors cursor-pointer">Services</span></Link></li>
              <li><Link href="/contact"><span className="text-sm text-white/60 hover:text-primary transition-colors cursor-pointer">Contact</span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy"><span className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></Link></li>
              <li><Link href="/terms"><span className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Terms of Service</span></Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2026 AIcreatesAI. All rights reserved.
          </p>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          </div>
        </div>
      </div>
    </footer>
  );
}
