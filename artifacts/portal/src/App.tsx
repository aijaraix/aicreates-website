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
import NotFound from "@/pages/not-found";

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
    cardBox:
      "bg-[#0F0F12] border border-white/10 rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white",
    headerSubtitle: "text-white/60",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-white/80",
    footerActionLink: "text-[#00F5D4] hover:text-[#00F5D4]/80",
    footerActionText: "text-white/60",
    dividerText: "text-white/50",
    formButtonPrimary:
      "bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium",
    formFieldInput: "bg-[#16161A] border-white/10 text-white",
    socialButtonsBlockButton:
      "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]",
    dividerLine: "bg-white/10",
    logoBox: "flex items-center justify-center",
    logoImage: "h-8",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0A0A0A] px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0A0A0A] px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
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
          <Route path="/invest">
            <Protected>
              <InvestPicker />
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
