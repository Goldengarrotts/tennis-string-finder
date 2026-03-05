# Price Comparison Data

JSON data store for the price comparison widget on string detail pages.
All files are committed to git — edit locally, commit, and deploy to publish changes.

## Files

| File | Purpose |
|---|---|
| `products.json` | Purchasable variants (12m set, 200m reel, gauge options) |
| `merchants.json` | Retailers (Amazon UK/US, Racquet Depot, Tennis Warehouse…) |
| `merchant-links.json` | Affiliate URL + ASIN per (product × merchant) pair |
| `price-checks.json` | Timestamped price observations (latest is shown in widget) |

## Admin UI

Visit `/admin/prices` in dev to update affiliate URLs and record prices via forms.
Changes write directly to JSON files — no manual editing needed.

## Adding a new string

1. Add product entries to `products.json`:
   ```json
   {
     "id": "brand-name-gauge-set",
     "stringSlug": "brand-name",
     "label": "12m Set — 1.25mm (17g)",
     "gauge": "1.25mm",
     "packType": "set",
     "reelMetres": null
   }
   ```

2. Add merchant link entries to `merchant-links.json`:
   ```json
   {
     "id": "ml-brand-name-gauge-set-amazon-uk",
     "productId": "brand-name-gauge-set",
     "merchantId": "amazon-uk",
     "url": null,
     "asin": "B00XXXXXXX"
   }
   ```
   - Leave `url` null for Amazon — it auto-generates a search URL.
   - Fill `asin` when known for a direct product link.

3. Visit `/admin/prices` to record prices.

## Phase 2 (future)

`PCMerchant.provider` supports `'api'` and `'scrape'` in addition to `'manual'`.
When a merchant has `provider: 'api'`, a cron job (Vercel Cron / GitHub Actions)
will call the configured endpoint (Amazon PA-API, affiliate network feed) and
write new entries to `price-checks.json` automatically.
