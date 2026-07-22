# v15 quarantined: exact selection result gate failed

This experiment is discovery evidence only. None of its runs may be admitted to the final behavioral or semantic result.

- Source HEAD: `8eb5b60ab5686e45f80b8cbcc49c731f6851915c`
- Protocol SHA-256: `sha256:13face170d72a68d57df6e4eb051b3720b12baa2eeb63af0f429bbcb87543d0c`
- Sealed semantic criteria SHA-256: `sha256:7363911fa0da6b6978a80c88e12549bda2f4681c2f0bf996ce32aa4044af10c5`
- Sealed commitment SHA-256: `sha256:42bcf9de3dd5167023f4dd9a66501244ec3264b4ded5b61c4efcb722c835d5af`
- Structurally valid runs: 66/66 (`candidate` 34, support 32)
- Candidate artifacts: 160; support artifacts: 140
- Structurally invalid attempts preserved: 2
- Exact candidate selection: 20/34; failed: 14
- Independent semantic review: not dispatched because the exact-selection gate failed first

The candidate loader activated the correct domains in every failed run, reached a stable fixed point, resolved final `Unknown` to zero, and obeyed the declared-load contract. The failures were semantic boundary errors in rule selection rather than missing skill activation or an invalid routing trace.

The 14 failed candidate runs exposed five source-level ambiguities:

1. RTE10 did not force the complete curried React handler contract (`R25 -> R07 -> T08/T07/T06`) consistently.
2. `T05` did not distinguish a named shape entering a new callable contract role from an anonymous inferred query result literal.
3. `R22` treated same-file `query.select` shaping as route-flow extraction.
4. `C08` allowed a domain-state modifier to be reported as N/A even though classifying the changed modifier is itself the rule's required decision.
5. `C01`, `C16`, `C17`, `T07`, `T08`, and `T09` needed clearer byte-equivalent, contextual-inference, and usage-only exclusions to prevent full-handbook over-selection.

The next source revision changes the rule source and adds pressure/regression coverage before creating a new immutable protocol binding. Because those edits change generated indexes, prompt bytes, and Git HEAD, all v15 artifacts are quarantined rather than reused.
