import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/lib/profile";

/**
 * Gate that ensures an investor profile exists before rendering children.
 * Redirects to /profile?next=<current> when missing. Used in front of
 * /invest, /saft/:id, /checkout/:id.
 */
export default function RequireProfile({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useProfile();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!data?.profile) {
      const next = encodeURIComponent(location || "/invest");
      setLocation(`/profile?next=${next}`);
    }
  }, [data, isLoading, location, setLocation]);

  if (isLoading || !data?.profile) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#00F5D4]" />
        Checking profile…
      </div>
    );
  }
  return <>{children}</>;
}
