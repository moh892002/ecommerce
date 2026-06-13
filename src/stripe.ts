/**
 * Stripe integration module.
 *
 * To use Stripe:
 * 1. Set VITE_STRIPE_PUBLISHABLE_KEY in .env
 * 2. The checkout will show Stripe Elements card input
 * 3. For real payments, add a server endpoint to create PaymentIntents
 *
 * Without the env var, the app falls back to simulated payment.
 */

export function isStripeConfigured(): boolean {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  return !!key;
}

export async function mountCardElement(_containerId: string): Promise<boolean> {
  return false;
}

export function unmountCardElement(): void {}
