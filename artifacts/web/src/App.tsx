import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
// Eve chat widget kept in the codebase but not mounted.
// To re-enable: uncomment the import and the <EveWidget /> mount below.
// import { EveWidget } from "@/components/EveWidget";

import Home from "@/pages/Home";
import EveOS from "@/pages/EveOS";
import NeoBank from "@/pages/NeoBank";
import Litepaper from "@/pages/Litepaper";
import Invest from "@/pages/Invest";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="flex flex-col min-h-[100dvh]"
  >
    {children}
  </motion.div>
);

const ScrollToTop = () => {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

function Router() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={() => <PageTransition><Home /></PageTransition>} />
        <Route path="/eve-os" component={() => <PageTransition><EveOS /></PageTransition>} />
        <Route path="/neobank" component={() => <PageTransition><NeoBank /></PageTransition>} />
        <Route path="/litepaper" component={() => <PageTransition><Litepaper /></PageTransition>} />
        <Route path="/invest" component={() => <PageTransition><Invest /></PageTransition>} />
        <Route path="/contact" component={() => <PageTransition><Contact /></PageTransition>} />
        <Route path="/privacy" component={() => <PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" component={() => <PageTransition><Terms /></PageTransition>} />
        <Route component={() => <PageTransition><NotFound /></PageTransition>} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <div className="relative min-h-[100dvh] flex flex-col bg-background text-foreground overflow-x-hidden">
            <Navigation />
            <main className="flex-1 flex flex-col">
              <Router />
            </main>
            <Footer />
            {/* <EveWidget /> */}
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
