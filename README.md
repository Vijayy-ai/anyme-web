# AnyMe Web

Dark, content-first marketing + free-watch site for **anyme.in**.

## Product rules (v1)

| Content | Website | App |
|--------|---------|-----|
| Free episode (`is_premium: false`) | Play in browser | Play normally |
| Premium episode (`is_premium: true`) | Get the App CTA only | Paywall / coins |

No coin purchase, IAP, wallet, or login unlock on the website.

## Pages

- `/` — Hero carousel + content rows
- `/series/[seriesId]` — Details + episode list
- `/watch/[seriesId]/[episodeId]` — Free playback (premium → app CTA)
- `/search` — Series search
- `/contact` — Contact

## Setup

```bash
npm install
cp .env.local.example .env.local   # or use the committed defaults below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Env

```
NEXT_PUBLIC_API_BASE=https://anyme.publicvm.com
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.snoozeit.anymeapp
NEXT_PUBLIC_APP_STORE_URL=https://apps.apple.com/app/anyme/id6760490198
```

## Playback

Free episodes call `get-url`, then stream via `/api/playback` (server-side CloudFront cookie proxy) + `hls.js` / Safari native HLS.
