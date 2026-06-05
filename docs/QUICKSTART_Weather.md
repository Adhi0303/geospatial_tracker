# Weather Tile Proxy - Quick Start

## 🚀 Install & Run (2 minutes)

```bash
# 1. Install dependencies
cd apps/web
pnpm install

# 2. Get OpenWeatherMap API key (free)
# Visit: https://openweathermap.org/api
# Sign up → Copy API key

# 3. Create .env.local
cp .env.example .env.local

# 4. Add your API key to .env.local
JWT_SECRET="$(openssl rand -base64 32)"
OPENWEATHERMAP_API_KEY="your_key_here"

# 5. Start server
pnpm dev

# 6. Open browser
# http://localhost:3000
# → Left panel → Weather Map dropdown → Select "Clouds"
```

## ✅ Success Indicators

**Console should show:**
```
[API Validator] OpenWeatherMap: ✓
[API Validator] Initialized 2 valid API tokens.
```

**Browser should show:**
- Cloud layer appears on globe
- DevTools Network tab: `/api/weather/tile/3/2/1?layer=clouds_new` → 200 OK

## 🔥 Hot Tips

- **Rate Limit:** 50 requests/minute per IP (OWM free tier is 60/min)
- **Cache:** Tiles cached for 3 hours by browser
- **Layers:** 5 available (clouds, precipitation, pressure, wind, temp)
- **Performance:** First load ~2s, cached loads ~50ms

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Tiles 404 | Check API key in `.env.local` |
| Rate limit | Wait 60 seconds or restart browser |
| No tiles showing | Select layer from dropdown (default is "none") |
| Console errors | Verify `instrumentationHook: true` in `next.config.ts` |

## 📁 Key Files

```
apps/web/src/
├── lib/apiKeyValidator.ts      ← JWT token generation
├── lib/weatherRateLimit.ts     ← Rate limiting
└── app/api/weather/tile/[z]/[x]/[y]/route.ts  ← Main proxy
```

## 🎯 What's Next?

**Phase 2 Options:**
1. Weather legend + opacity slider (1 hour)
2. Traffic layer with Google Maps API (3 hours)
3. Live camera feeds (2 hours)

See `docs/Phase1_Weather_Tile_Implementation.md` for full details.
