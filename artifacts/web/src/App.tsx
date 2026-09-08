import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import React, { lazy, Suspense, useEffect } from "react";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
// Eve chat widget kept in the codebase but not mounted.
// To re-enable: uncomment the import and the <EveWidget /> mount below.
// import { EveWidget } from "@/components/EveWidget";

import Home from "@/pages/Home";
const EveOS = lazy(() => import("@/pages/EveOS"));
const NeoBank = lazy(() => import("@/pages/NeoBank"));
const About = lazy(() => import("@/pages/About"));
const Business = lazy(() => import("@/pages/Business"));
const Developers = lazy(() => import("@/pages/Developers"));
const Token = lazy(() => import("@/pages/Token"));
const Roadmap = lazy(() => import("@/pages/Roadmap"));
const Faq = lazy(() => import("@/pages/Faq"));
const Press = lazy(() => import("@/pages/Press"));
const Litepaper = lazy(() => import("@/pages/Litepaper"));
const Invest = lazy(() => import("@/pages/Invest"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
        <Route
          path="/"
          component={() => (
            <PageTransition>
              <Home />
            </PageTransition>
          )}
        />
        <Route
          path="/about"
          component={() => (
            <PageTransition>
              <About />
            </PageTransition>
          )}
        />
        <Route
          path="/platform"
          component={() => (
            <PageTransition>
              <About />
            </PageTransition>
          )}
        />
        <Route
          path="/agents"
          component={() => (
            <PageTransition>
              <About />
            </PageTransition>
          )}
        />
        <Route
          path="/company-in-a-box"
          component={() => (
            <PageTransition>
              <About />
            </PageTransition>
          )}
        />
        <Route
          path="/business"
          component={() => (
            <PageTransition>
              <Business />
            </PageTransition>
          )}
        />
        <Route
          path="/developers"
          component={() => (
            <PageTransition>
              <Developers />
            </PageTransition>
          )}
        />
        <Route
          path="/token"
          component={() => (
            <PageTransition>
              <Token />
            </PageTransition>
          )}
        />
        <Route
          path="/roadmap"
          component={() => (
            <PageTransition>
              <Roadmap />
            </PageTransition>
          )}
        />
        <Route
          path="/faq"
          component={() => (
            <PageTransition>
              <Faq />
            </PageTransition>
          )}
        />
        <Route
          path="/press"
          component={() => (
            <PageTransition>
              <Press />
            </PageTransition>
          )}
        />
        <Route
          path="/eve-cxo"
          component={() => (
            <PageTransition>
              <EveOS />
            </PageTransition>
          )}
        />
        <Route
          path="/eve-os"
          component={() => (
            <PageTransition>
              <EveOS />
            </PageTransition>
          )}
        />
        <Route
          path="/neobank"
          component={() => (
            <PageTransition>
              <NeoBank />
            </PageTransition>
          )}
        />
        <Route
          path="/litepaper"
          component={() => (
            <PageTransition>
              <Litepaper />
            </PageTransition>
          )}
        />
        <Route
          path="/opportunity"
          component={() => (
            <PageTransition>
              <Invest />
            </PageTransition>
          )}
        />
        <Route
          path="/invest"
          component={() => {
            const [, navigate] = useLocation();
            useEffect(() => {
              navigate("/opportunity", { replace: true });
            }, [navigate]);
            return null;
          }}
        />
        <Route
          path="/contact"
          component={() => (
            <PageTransition>
              <Contact />
            </PageTransition>
          )}
        />
        <Route
          path="/privacy"
          component={() => (
            <PageTransition>
              <Privacy />
            </PageTransition>
          )}
        />
        <Route
          path="/terms"
          component={() => (
            <PageTransition>
              <Terms />
            </PageTransition>
          )}
        />
        <Route
          component={() => (
            <PageTransition>
              <NotFound />
            </PageTransition>
          )}
        />
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
          <div className="relative min-h-[100dvh] flex flex-col bg-background text-foreground overflow-x-clip">
            <Navigation />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:p-3"
            >
              Skip to content
            </a>
            <main id="main-content" className="flex-1 flex flex-col">
              <Suspense fallback={<div role="status" className="container mx-auto min-h-[60vh] px-4 pt-32 text-white/70">Loading page…</div>}>
                <Router />
              </Suspense>
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
