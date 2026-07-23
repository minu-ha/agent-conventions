# v13 preflight gate failure

This seal is discovery evidence only and must not be used for candidate admission or semantic review.

- Source HEAD: `dd4942f68f446e46064cac8e700952241bfd84e4`
- Protocol SHA-256: `sha256:5af6a9bf35b616940b1f8e08d1d93b48a57d63a848dbf31966525ddf372ee896`
- Criteria SHA-256: `sha256:241ea20c3d601211ac387d726c1d6e8caa12bd4582c1fafc6b85f10246b4d06f`
- Commitment file SHA-256: `sha256:b02e7fae015424ede542287002fae4940d4a510c455029998f3a1b291376bfb0`
- Fresh behavioral runs dispatched: `0`

The source, protocol, and criteria bindings passed the semantic seal checks, but the full package suite finished `188/189`: the convention-audit router had compressed away the exact `변경 semantic delta` / `삭제+추가` wording required by the source regression test. The router was corrected in the next source commit before any child dispatch. Because the Git HEAD changed, this seal is permanently invalid for the final experiment.
