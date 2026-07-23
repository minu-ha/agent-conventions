# Invalid v9 matrix attempt

- Run: `mutation--RTE08-mutation-selected-to-na--t1`
- Attempt: `3`
- Binding HEAD: `6a73a0a733579667ecf98a0a1fd18bec2af0108e`
- Protocol SHA-256: `3bb92a82504457d1fd8f5a935d573e62ca97fc10208117327cc47f91eaf85006`
- Criteria SHA-256: `cd5fd46b910da5dcb649d9ca830dd70034041d435e406cfcfd63429cc9896380`
- Commitment SHA-256: `2143bf87cc9191d176b4798ae98a408a10377b5300be444d80b6774b8c5855db`
- Coordinator error: `run.completion.semanticFailCount must equal semantic FAIL verdict count.`

The child request, dispatch envelope, and child payload are archived byte-for-byte without repair. The strict merge rejected the malformed mutation payload before producing a run artifact. This is the third consecutive occurrence of the same blocking condition. The v9 matrix is stopped; no additional retry or coordinate was prepared.
