# implw observability

The autonomous provider step emits an immediate `provider_started` notice, a bounded heartbeat every 60 seconds by default, a stall classification after 120 seconds without output growth, and a final `provider_completed` notice. Repository variables `IMPLW_HEARTBEAT_INTERVAL_SECONDS` and `IMPLW_HEARTBEAT_STALL_WINDOW_SECONDS` may override those values within the script's safe bounds.

Claude runs in `stream-json` mode. After it exits, a best-effort parser writes a schema-versioned usage record and a metadata-only diagnostic trace. Token counters are the primary consumption evidence. Subscription authentication can omit `total_cost_usd`, in which case cost remains `null`; it must not be inferred from an unverified billing rate.

The raw stream is temporary and is never uploaded. Artifacts omit messages, prompts, tool inputs/results, issue bodies, environment data, credentials, process arguments, and host paths. Telemetry failure warns but never changes the provider's exit status.

GitHub may return HTTP 404 for the raw log endpoint while a self-hosted job is active, as observed on run `33597112393`. Heartbeats improve the Actions UI and completed-run evidence, but API clients cannot guarantee retrieval of in-progress log bytes until GitHub exposes them.
