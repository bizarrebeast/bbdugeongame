// Thin wrapper around Google Analytics 4's gtag. The gtag snippet is loaded
// from index.html so this module just calls into window.gtag if available
// — no-ops cleanly when GA hasn't loaded yet or has been blocked.

const GAME_NAME = 'treasurequest';

function detectHost(): 'telegram' | 'farcade' | 'web' {
  const w = window as any;
  if (w.Telegram?.WebApp?.initData) return 'telegram';
  if (w.FarcadeSDK) return 'farcade';
  return 'web';
}

export function trackAnalytics(event: string, params: Record<string, any> = {}): void {
  const gtag = (window as any).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', event, { game_name: GAME_NAME, host: detectHost(), ...params });
}
