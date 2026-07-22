# Behavioral pilot v5 old-HEAD record

These coordinator-created request/envelope files target source HEAD
`80d8bc3007f0bfaeb578168626802a4cced00bf4`. The t2 child was interrupted
before producing a payload, so these files are discovery evidence only.

The sibling `2026-07-21-v5-pilot-invalid` directory preserves the untouched t1
payload that proved the generated-digest disclosure worked but replaced rather
than accumulated `scopeEvidence`. Source now publishes that append-only rule and
the remaining exact validator invariants, so every final run must use the later
source binding.
