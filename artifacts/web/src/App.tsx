import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";

// Components
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { EveWidget } from "@/components/EveWidget";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Technology from "@/pages/Technology";
import Products from "@/pages/Products";
import Fin from "@/pages/Fin";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col min-h-[100dvh]"
    >
      {children}
    </motion.div>
  );
};

// Scroll to top on route change
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
        <Route path="/about" component={() => <PageTransition><About /></PageTransition>} />
        <Route path="/technology" component={() => <PageTransition><Technology /></PageTransition>} />
        <Route path="/products" component={() => <PageTransition><Products /></PageTransition>} />
        <Route path="/products/fin" component={() => <PageTransition><Fin /></PageTransition>} />
        <Route path="/services" component={() => <PageTransition><Services /></PageTransition>} />
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
            <EveWidget />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
