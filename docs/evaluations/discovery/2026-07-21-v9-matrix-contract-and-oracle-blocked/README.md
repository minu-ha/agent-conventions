# v9 matrix stopped by mutation contract and routing-oracle defects

- Evaluated source: `6a73a0a733579667ecf98a0a1fd18bec2af0108e`
- Protocol SHA-256: `3bb92a82504457d1fd8f5a935d573e62ca97fc10208117327cc47f91eaf85006`
- Sealed semantic criteria SHA-256: `cd5fd46b910da5dcb649d9ca830dd70034041d435e406cfcfd63429cc9896380`
- Sealed semantic commitment SHA-256: `2143bf87cc9191d176b4798ae98a408a10377b5300be444d80b6774b8c5855db`
- Valid immutable runs before stop: `63/66`
- Eligible full-handbook/progressive candidates: `34`
- Exact-selection candidates: `16/34`
- Archived invalid attempts: `7`
- Repeated stop coordinate: `mutation--RTE08-mutation-selected-to-na--t1`

The three mutation children independently found the intended unsupported `R26 Selected -> N/A` mutation. They reported it as one coverage failure while also emitting a semantic `FAIL` verdict. The generic completion validator correctly rejected the inconsistent `semanticFailCount`, but the mutation arm had not disclosed whether the supplied-receipt defect belonged to coverage or semantic accounting. After the same ambiguity failed three times, the matrix stopped; mutation trials `t1` through `t3` are absent.

Post-stop audit also found that only 16 of the 34 otherwise valid candidate runs exactly matched the sealed routing oracle. The 18 mismatches combine three distinct defects: under-selected oracle entries for changed props/types/CSS pseudo-state surfaces, ambiguous applicability text around pure relocation and owner naming, and a smaller set of genuine evaluator selection errors. The accepted candidates additionally exposed semantic failures, including signature-level props destructuring and nesting `:hover` under a domain-state modifier.

Because semantic preparation requires all 34 candidates to have exact routing matches, no blind semantic batch was dispatched. These 63 runs remain failure/discovery evidence only. They must not be combined with later mutation trials or rescored under revised rules, oracles, criteria, generated digests, or source commits.

The sibling `2026-07-21-v9-matrix-invalid-attempts/` directory preserves all seven invalid request/envelope/payload attempts. `2026-07-21-v9-matrix-administrative-recovery/` preserves the one coordinator-side archival correction separately and does not add an evaluator invalid attempt.
