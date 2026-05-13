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
import AdminChat from "@/pages/AdminChat";
import ChatWidget from "@/components/ChatWidget";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Gateway from "@/pages/Gateway";
import Documents from "@/pages/Documents";
import Faq from "@/pages/Faq";
import Profile from "@/pages/Profile";
import RequireProfile from "@/components/RequireProfile";
import NotFound from "@/pages/not-found";
import { SectionLabel } from "@/components/brand";
import SiteHeader from "@/components/SiteHeader";
import { useInvestSeo } from "@/lib/useInvestSeo";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
function resolveClerkProxyUrl(): string | undefined {
  if (!import.meta.env.PROD) return undefined;
  const raw = import.meta.env.VITE_CLERK_PROXY_URL;
  if (!raw) return undefined;
  // Clerk requires an absolute URL. The env var is typically set as a
  // path (e.g. "/api/__clerk") so it works across multiple custom
  // domains; resolve it against the current origin at runtime.
  if (/^https?:\/\//i.test(raw)) return raw;
  try {
    return new URL(raw, window.location.origin).toString();
  } catch {
    return undefined;
  }
}
const clerkProxyUrl = resolveClerkProxyUrl();
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

function AuthBackButton() {
  const [, setLocation] = useLocation();
  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-full h-9 px-5 glass-btn text-sm font-medium"
      data-testid="link-auth-back"
    >
      <span aria-hidden>←</span> Back
    </button>
  );
}

function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-[100dvh] text-white overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-fade -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] portal-aurora rounded-full -z-10"
      />
      <SiteHeader
        homeHref="https://www.aicreates.ai"
        homeExternal
        homeTestId="link-auth-home"
        rightSlot={<AuthBackButton />}
      />
      <main className="px-4 pt-4 pb-16 md:pt-10 flex flex-col items-center">
        <div className="max-w-md w-full text-center mb-8">
          <div className="mb-5 flex justify-center">
            <SectionLabel>{eyebrow}</SectionLabel>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
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
  useInvestSeo({
    title: "Sign In",
    description:
      "Sign in to your AIcreatesAI investor portal to manage AICA commitments, SAFTs, and vesting.",
    path: "/sign-in",
  });
  return (
    <AuthShell
      eyebrow="Investor portal"
      title="Welcome back."
      subtitle="Sign in to manage your AICA private-sale commitment, SAFTs, and vesting schedule."
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
  useInvestSeo({
    title: "Sign Up",
    description:
      "Create your AIcreatesAI investor account to access the deck, complete a SAFT, and fund a commitment.",
    path: "/sign-up",
  });
  return (
    <AuthShell
      eyebrow="AICA Strategic Seed Round - 2026"
      title="Reserve your allocation."
      subtitle="Create your investor account to access the deck, complete the SAFT, and fund a commitment."
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

function ChatWidgetGate() {
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: { role: string } }>("/me"),
    staleTime: 60_000,
  });
  // Don't mount until we know the role -- otherwise admins briefly open
  // an investor WS ticket during the first paint.
  if (!me.data) return null;
  if (me.data.user.role === "admin") return null;
  return <ChatWidget />;
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
          <Route path="/profile">
            <Protected>
              <Profile />
            </Protected>
          </Route>
          <Route path="/invest">
            <Protected>
              <RequireProfile>
                <InvestPicker />
              </RequireProfile>
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
              <RequireProfile>
                <Saft />
              </RequireProfile>
            </Protected>
          </Route>
          <Route path="/checkout/:commitId">
            <Protected>
              <RequireProfile>
                <Checkout />
              </RequireProfile>
            </Protected>
          </Route>
          <Route path="/admin">
            <Protected>
              <Admin />
            </Protected>
          </Route>
          <Route path="/admin/chat">
            <Protected>
              <AdminChat />
            </Protected>
          </Route>
          <Route component={NotFound} />
        </Switch>
        <Show when="signed-in">
          <ChatWidgetGate />
        </Show>
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
