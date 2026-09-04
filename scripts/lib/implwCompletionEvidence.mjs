// Fail-closed completion-evidence contract for implw (BUG htu-foundation#333).
//
// Run `30344067030` concluded `success` despite producing no PR, no
// completion manifest, and only a 283-byte diagnostics artifact — the
// provider subprocess's own exit code was the only signal the workflow
// checked, and a stalled/paused agent that never published anything still
// exits 0 in some paths. This module is the single place that decides
// whether a run's outcome may be reported as successful: exactly one of a
// verified pushed-commit-plus-PR result, or an explicit governed no-change
// manifest, is accepted. Anything else — including "the provider exited
// 0" on its own — is not evidence.

export const COMPLETION_CLASSIFICATIONS = [
  'change_verified',
  'no_change_verified',
  'missing_completion_evidence',
  'unverified_completion_evidence',
  'invalid_no_change_manifest',
];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidNoChangeManifest(manifest) {
  return isNonEmptyString(manifest?.reason) && isNonEmptyString(manifest?.evidence);
}

function isValidPr(pr) {
  return Boolean(pr) && isNonEmptyString(String(pr.number ?? '')) && isNonEmptyString(pr.url) && isNonEmptyString(pr.headSha);
}

/**
 * Classify a run's completion evidence.
 *
 * `pr` — GitHub-verified PR state for the run's branch, or `null` if none
 * was found: `{ number, url, headSha }`. `headSha` must be the PR's head
 * SHA as reported by GitHub (not merely the local branch tip) so a stale
 * or unpushed PR record cannot pass.
 *
 * `pushedHeadSha` — the local branch tip after the run, independently
 * observed (e.g. `git rev-parse <branch>`). When `pr` is present, this
 * must match `pr.headSha`; a mismatch means the PR does not reflect what
 * was actually pushed and is treated as contradictory evidence, not proof.
 *
 * `noChangeManifest` — an explicit governed no-change result, or `null`.
 * Only consulted when `pr` is absent (a no-change run has no PR by
 * definition); a manifest without an accompanying PR is authoritative for
 * the no-change path.
 *
 * Returns `{ ok, classification, reason, manifest }`. `manifest` always
 * carries `requestedProvider`/`resolvedProvider` alongside whichever
 * evidence resolved the classification, for audit.
 */
export function classifyCompletionEvidence({
  pr = null,
  pushedHeadSha = null,
  noChangeManifest = null,
  requestedProvider,
  resolvedProvider,
}) {
  const base = { requestedProvider, resolvedProvider };

  if (pr) {
    if (!isValidPr(pr)) {
      return {
        ok: false,
        classification: 'unverified_completion_evidence',
        reason: 'a PR was found for this run but is missing number, url, or head SHA',
        manifest: { ...base, pr },
      };
    }
    if (pushedHeadSha && pr.headSha !== pushedHeadSha) {
      return {
        ok: false,
        classification: 'unverified_completion_evidence',
        reason: `PR head SHA (${pr.headSha}) does not match the pushed branch tip (${pushedHeadSha}) — evidence is contradictory`,
        manifest: { ...base, pr, pushedHeadSha },
      };
    }
    return {
      ok: true,
      classification: 'change_verified',
      reason: `verified pushed commit and reviewable PR #${pr.number} at head ${pr.headSha}`,
      manifest: { ...base, kind: 'change', pr },
    };
  }

  if (noChangeManifest) {
    if (!isValidNoChangeManifest(noChangeManifest)) {
      return {
        ok: false,
        classification: 'invalid_no_change_manifest',
        reason: 'a no-change manifest was supplied but is missing a non-empty reason and/or evidence field',
        manifest: { ...base, noChangeManifest },
      };
    }
    return {
      ok: true,
      classification: 'no_change_verified',
      reason: 'explicit governed no-change manifest with reason and evidence accepted',
      manifest: {
        ...base,
        kind: 'no_change',
        reason: noChangeManifest.reason,
        evidence: noChangeManifest.evidence,
      },
    };
  }

  return {
    ok: false,
    classification: 'missing_completion_evidence',
    reason: 'no PR was found for this run and no no-change manifest was supplied — nothing to verify',
    manifest: { ...base },
  };
}
