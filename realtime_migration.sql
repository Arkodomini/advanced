-- ============================================================
-- Advanced Notes — Realtime Migration
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- ============================================================

-- Enable Postgres Changes replication for realtime
alter publication supabase_realtime add table cards;
alter publication supabase_realtime add table boards;
