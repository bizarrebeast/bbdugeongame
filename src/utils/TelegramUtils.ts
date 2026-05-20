// Telegram Mini App adapter for Treasure Quest.
// Mirrors RemixUtils but for Telegram — detects host, posts play_start/play_end
// to the same tracker that serves the game HTML (same-origin, no CORS).
//
// Semantics:
//   - One play = one full session from fresh-game start to final game over (lives = 0).
//   - notifyTelegramPlayStart is idempotent: callable on every level-ready hook;
//     only the first call per play actually fires play_start.
//   - notifyTelegramPlayEnd is also idempotent — fires once per play.

const GAME_ID = 'treasurequest';

let inTelegram = false;
let TG: any = null;
let pendingTrack: Promise<any> = Promise.resolve();
let currentPlayId: number | null = null;
let playInProgress = false;

export function isTelegramHost(): boolean {
  return inTelegram;
}

export function initializeTelegram(game: Phaser.Game): void {
  TG = (window as any).Telegram?.WebApp;
  inTelegram = !!(TG && TG.initData);
  if (!inTelegram) return;

  try {
    TG.ready();
    TG.expand();
    TG.disableVerticalSwipes?.();
  } catch {
    // Older Telegram clients may lack some APIs; harmless.
  }

  // Pull personal best into the registry so splash can show "BEST: X".
  fetch('/api/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: TG.initData, game: GAME_ID }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (d?.high_score != null) game.registry.set('tgHighScore', d.high_score);
      if (d?.high_score_meta) game.registry.set('tgHighScoreMeta', d.high_score_meta);
    })
    .catch(() => {});
}

function postTrack(event: 'play_start' | 'play_end', payload: Record<string, unknown> = {}): Promise<any> {
  if (!inTelegram) return Promise.resolve(null);
  pendingTrack = pendingTrack.then(() =>
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, game: GAME_ID, initData: TG.initData, ...payload }),
      keepalive: true, // survives Mini App close on play_end
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  );
  return pendingTrack;
}

export function notifyTelegramPlayStart(): void {
  if (!inTelegram || playInProgress) return;
  playInProgress = true;
  postTrack('play_start').then((res: any) => {
    if (res?.play_id) currentPlayId = res.play_id;
  });
}

export function notifyTelegramPlayEnd(score: number, meta?: Record<string, unknown>): void {
  if (!inTelegram || !playInProgress) return;
  playInProgress = false;
  postTrack('play_end', { score, play_id: currentPlayId, meta });
  currentPlayId = null;
}

export function triggerTelegramHaptic(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (!inTelegram) return;
  try {
    TG.HapticFeedback?.impactOccurred?.(type);
  } catch {
    // ignore
  }
}

/**
 * Opens Telegram's native share sheet pre-filled with the player's score and a
 * link back to this game (carrying startapp=share for attribution).
 */
export function shareScore(score: number, label: string): void {
  if (!inTelegram) return;
  const gameUrl = `https://t.me/BizarreBeastsBot/${GAME_ID}?startapp=share`;
  const url = encodeURIComponent(gameUrl);
  const text = encodeURIComponent(`I scored ${score.toLocaleString()} in ${label}. Beat me 👾`);
  try {
    TG.openTelegramLink(`https://t.me/share/url?url=${url}&text=${text}`);
  } catch {
    // ignore
  }
}
