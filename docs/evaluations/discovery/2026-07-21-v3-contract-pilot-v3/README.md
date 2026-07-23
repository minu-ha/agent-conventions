# Behavioral contract pilot v3 discovery record

These artifacts are preserved exactly as produced against source HEAD
`7a1bc91c3e0957ffbcdc1c9a31942a4a59e0900c` and the v3 sealed semantic
criteria. They are discovery evidence only and are excluded from the final
behavioral matrix.

- `no-skill--derive-existing-contract-with-docs--t1` passed the coordinator
  validator on that old HEAD.
- `progressive--derive-existing-contract-with-docs--t1` was rejected because
  pass 1 left `requiresSelectedAdded` empty even though the validator defines
  pass 1's previous selection as empty. The dispatched child contract exposed
  the field shape but did not define this delta semantics.
- The child payload was not repaired. The contract and its regression test were
  changed in source, so every final run must be freshly dispatched against the
  new source binding.
