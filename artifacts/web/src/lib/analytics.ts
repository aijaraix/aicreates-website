type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track(name: string, data?: AnalyticsData): void;
    };
  }
}

export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === "undefined") return;

  try {
    window.umami?.track(name, data);
  } catch {
    // Analytics must never break the app or interrupt navigation.
  }
}

export function trackOutboundProductCta({
  product,
  sourcePage,
  destination,
}: {
  product: "eve" | "finpaytek";
  sourcePage: "/eve-os" | "/neobank";
  destination: "evecxo.com" | "finpaytek.com";
}): void {
  trackEvent("outbound_product_cta_click", {
    product,
    source_page: sourcePage,
    destination,
  });
}