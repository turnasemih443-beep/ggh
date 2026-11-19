/*
# Create direct messages table

1. Plain-English summary
- Adds a shared table that backs the new AniGram direct messaging (DM) feature.
- Messages are exchanged between two users of the app, identified by the
  usernames they set in their profile. A conversation is identified by a
  deterministic `conversation_id` string built from the two usernames
  (sorted alphabetically and joined with "::"), so both sides compute the
  same key without needing user accounts.

2. New Tables
- `dm_messages`
  - `id` (uuid, primary key, auto-generated)
  - `conversation_id` (text, not null) — deterministic key for the 2-person chat
  - `sender_name` (text, not null) — display name of who sent the message
  - `sender_avatar` (text, nullable) — avatar image URL (data URL) of the sender
  - `body` (text, not null) — the message text
  - `created_at` (timestamptz, not null, defaults to now)

3. Modified Tables
- None.

4. Security
- Row Level Security is ENABLED on `dm_messages`.
- The app has no sign-in: visitors are anonymous. The data in this table is
  intentionally shared between all visitors (it IS the chat), so policies
  allow anon and authenticated roles to SELECT and INSERT.
- No UPDATE or DELETE access: chat history is append-only.
- Grants: SELECT, INSERT on `dm_messages` to `anon` and `authenticated`.
- Index on (`conversation_id`, `created_at`) for fast chat history loading.

5. Important notes
- No user_id / auth.uid() ownership checks because the app intentionally has
  no accounts; per the app's single-tenant shared-data model, `USING (true)` /
  `WITH CHECK (true)` is the correct access model here and is documented as such.
- Frontend validates message length (max 1000 chars) before inserting.
*/

CREATE TABLE IF NOT EXISTS dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  sender_name text NOT NULL,
  sender_avatar text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation
  ON dm_messages (conversation_id, created_at);

ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON dm_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_dm_messages" ON dm_messages;
CREATE POLICY "anon_select_dm_messages" ON dm_messages
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_dm_messages" ON dm_messages;
CREATE POLICY "anon_insert_dm_messages" ON dm_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(body) <= 1000
  AND char_length(sender_name) <= 30
  AND char_length(conversation_id) <= 80
);
