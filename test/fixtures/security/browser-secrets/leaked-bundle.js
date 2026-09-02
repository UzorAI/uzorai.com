// Fixture: a browser bundle excerpt carrying SYNTHETIC, non-functional
// credential-shaped values — used only to prove
// scripts/security/assert-no-browser-secrets.mjs's checker actually flags
// leaked-secret shapes. None of these are real; they never authenticate
// against anything. Never replace these with a real secret value, even
// temporarily.
export const FAKE_AWS_KEY = "AKIAFAKE1234567890AB";

export const FAKE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
SYNTHETIC-FAKE-NOT-REAL-DO-NOT-USE
-----END PRIVATE KEY-----`;

const apiKey = "sk-synthetic-FAKE1234567890ABCDEF";

const CLOUDFLARE_API_TOKEN = "synthetic-fake-value-not-real";
