import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { dark } from "@clerk/themes";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import InvestPicker from "@/pages/InvestPicker";
import Saft from "@/pages/Saft";
import Checkout from "@/pages/Checkout";
import Admin from "@/pages/Admin";
import Gateway from "@/pages/Gateway";
import Documents from "@/pages/Documents";
import Faq from "@/pages/Faq";
import NotFound from "@/pages/not-found";
import { Wordmark } from "@/components/brand";
import { Link } from "wouter";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.PROD
  ? import.meta.env.VITE_CLERK_PROXY_URL
  : undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(p: string): string {
  return basePath && p.startsWith(basePath)
    ? p.slice(basePath.length) || "/"
    : p;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#00F5D4",
    colorForeground: "#F5F5F5",
    colorMutedForeground: "#A1A1AA",
    colorDanger: "#ef4444",
    colorBackground: "#0F0F12",
    colorInput: "#16161A",
    colorInputForeground: "#F5F5F5",
    colorNeutral: "#27272A",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "w-[440px] max-w-full",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none px-7 pt-8 pb-7",
    footer: "!shadow-none !border-0 !rounded-none",
    socialButtonsBlockButtonText: "text-white font-medium",
    formFieldLabel:
      "text-white/70 text-[11px] uppercase tracking-[0.14em] font-medium",
    footerActionText: "text-white/55 text-sm",
    formButtonPrimary: "h-11 font-medium tracking-tight",
    logoBox: "flex items-center justify-center mb-2",
    logoImage: "h-7",
  },
};

function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  altCta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  altCta: { href: string; label: string; variant: "primary" | "outline" };
}) {
  const altCtaClass =
    altCta.variant === "primary"
      ? "inline-flex items-center justify-center rounded-full h-9 px-5 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 text-sm font-medium transition"
      : "inline-flex items-center justify-center rounded-full h-9 px-5 border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] text-sm font-medium transition";
  return (
    <div className="relative isolate min-h-[100dvh] bg-[#0A0A0A] text-white overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-fade -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] portal-aurora rounded-full -z-10"
      />
      <header className="px-6 md:px-10 py-5 flex items-center justify-between">
        <a href="https://www.aicreates.ai" className="inline-flex items-center">
          <Wordmark />
        </a>
        <nav className="flex items-center gap-2 text-sm">
          <Link href={altCta.href} className={altCtaClass}>
            {altCta.label}
          </Link>
        </nav>
      </header>
      <main className="px-4 pt-4 pb-16 md:pt-10 flex flex-col items-center">
        <div className="max-w-md w-full text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              {eyebrow}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-gradient">
            {title}
          </h1>
          <p className="mt-3 text-white/60 text-sm">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthShell
      eyebrow="Investor portal"
      title="Welcome back."
      subtitle="Sign in to manage your AICA Founders Round commitment, SAFTs, and vesting schedule."
      altCta={{ href: "/sign-up", label: "Reserve allocation", variant: "primary" }}
    >
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </AuthShell>
  );
}

function SignUpPage() {
  return (
    <AuthShell
      eyebrow="AICA Founders Round - 2026"
      title="Reserve your allocation."
      subtitle="Create your investor account to access the deck, complete the SAFT, and fund a commitment."
      altCta={{ href: "/sign-in", label: "Sign in", variant: "outline" }}
    >
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </AuthShell>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prev = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const off = addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prev.current !== undefined && prev.current !== id) {
        qc.clear();
      }
      prev.current = id;
    });
    return off;
  }, [addListener, qc]);
  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/dashboard">
            <Protected>
              <Dashboard />
            </Protected>
          </Route>
          <Route path="/gateway">
            <Protected>
              <Gateway />
            </Protected>
          </Route>
          <Route path="/invest">
            <Protected>
              <InvestPicker />
            </Protected>
          </Route>
          <Route path="/documents">
            <Protected>
              <Documents />
            </Protected>
          </Route>
          <Route path="/faq">
            <Protected>
              <Faq />
            </Protected>
          </Route>
          <Route path="/saft/:commitId">
            <Protected>
              <Saft />
            </Protected>
          </Route>
          <Route path="/checkout/:commitId">
            <Protected>
              <Checkout />
            </Protected>
          </Route>
          <Route path="/admin">
            <Protected>
              <Admin />
            </Protected>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
