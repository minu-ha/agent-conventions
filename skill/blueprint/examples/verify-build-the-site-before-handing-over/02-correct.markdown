## Checks

```sh
npm run docs:build
grep -ohE "^### [DQBR][0-9]+$" content/public/questions.md | sort | uniq -d
grep -cE "^\| A ★" content/public/questions.md
grep -nE "[가-힣]+다$" content/public/screen/orders.md
```

- build: 29 files, 경고 0
- 번호 중복: 없음
- ★: 카드 4, ★ 4
- 서술 어미: 0
- 눈 확인: Screen 절 밝음, 어두움, 390 캡처 셋
