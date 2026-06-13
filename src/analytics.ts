/**
 * Analytics wrapper.
 *
 * To enable:
 * 1. Set VITE_POSTHOG_KEY in .env
 * 2. Events are captured automatically on pageview, add-to-cart, order, etc.
 */

const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const posthogHost = (import.meta.env.VITE_POSTHOG_HOST as string) || "https://app.posthog.com";

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (id: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
    };
  }
}

export function initAnalytics(): void {
  if (!posthogKey) return;
  // Load PostHog script (lazy)
  const script = document.createElement("script");
  script.src = `${posthogHost}/static/array.js`;
  script.crossOrigin = "anonymous";
  script.onload = () => {
    if (window.posthog) {
      window.posthog.capture("$pageview");
    }
  };
  document.head.appendChild(script);
}

export function captureEvent(event: string, properties?: Record<string, unknown>): void {
  if (window.posthog) {
    window.posthog.capture(event, properties);
  }
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (window.posthog) {
    window.posthog.identify(userId, properties);
  }
}

export function resetAnalytics(): void {
  if (window.posthog) {
    window.posthog.reset();
  }
}
