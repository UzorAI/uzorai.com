// Fixture: a browser bundle excerpt with no secret-shaped content. Used by
// scripts/security/assert-no-browser-secrets.mjs to prove the scanner
// doesn't flag ordinary application code.
export const config = {
  apiBase: "/api",
  featureFlags: { newNav: true },
};

export function greet(name) {
  return `hello, ${name}`;
}
