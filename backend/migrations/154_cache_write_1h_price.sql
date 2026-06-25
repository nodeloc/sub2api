-- Separate 1-hour cache-write price (Claude-style: 1h cache write = 2x input,
-- vs 5m cache write = 1.25x input). Nullable: when unset, billing falls back to
-- cache_write_price, so existing channels are unaffected.
ALTER TABLE channel_model_pricing
    ADD COLUMN IF NOT EXISTS cache_write_1h_price NUMERIC(20, 12);
