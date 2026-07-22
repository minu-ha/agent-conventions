# Behavioral matrix v4 old-HEAD record

These artifacts are preserved against source HEAD
`4e99ca0428f09e83e6dc1d44af5052910d4ba439`. They are discovery evidence and
must not be counted in the final matrix.

- Four completed runs were valid on that HEAD: the two
  `derive-existing-contract-with-docs` pilots and two no-skill `BASELINE-R`
  trials.
- Some later coordinates contain only coordinator-created request/envelope
  files because execution was stopped before a child payload was accepted.
- Two independent full-handbook `BASELINE-R` children were rejected because
  the validator required current generated routing digests in every trace, but
  the request neither disclosed those digest values nor allowed the child to
  read `RULES_INDEX.md`. Their unchanged payloads and errors are preserved in
  the sibling `2026-07-21-v4-matrix-invalid-attempts` directory.
- Source now provides the complete three-skill digest dictionary as a
  mechanical, non-selection binding. Every final coordinate must therefore be
  freshly dispatched against the later source HEAD.
