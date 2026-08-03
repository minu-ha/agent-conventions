---
title: Limit Nesting Block Depth
titleKo: 중첩 블록 깊이 제한
impact: HIGH
impactDescription: 들여쓰기가 깊어져 규칙의 적용 대상을 머릿속에서 조립해야 하는 상태를 막습니다
appliesWhen:
  - 중첩 `{}` block을 추가하거나 기존 block을 펼치거나 합칠 때
  - raw HTML prose·copy·content wrapper 안 element selector를 추가·수정할 때
reviewWith: selector-avoid-deep-descendant-dependencies
tags: selectors, nesting, block-depth
---

## Limit Nesting Block Depth

**Impact: HIGH (들여쓰기가 깊어져 규칙의 적용 대상을 머릿속에서 조립해야 하는 상태를 막습니다)**

**중첩**은 `{}`를 겹치는 것이고, 브라우저는 이를 펼쳐서 평가합니다.
그래서 이 규칙은 가독성만 담당합니다. 결합자 개수는 `selector-avoid-deep-descendant-dependencies`가 셉니다.

- 중첩 block은 2단까지 씁니다. top-level class block 안에 한 겹만 더 엽니다.
- 중첩 block 안에서 다시 중첩 block을 열지 않습니다.
- third-party 경로는 결합자가 몇 개든 한 줄로 적습니다. 중첩으로 나누면 깊이가 보이지 않습니다.

중첩을 펼쳐도 펼친 selector가 같아서 마크업 변경에 똑같이 깨집니다. 펼치는 것은 개선이 아닙니다.

동작 차이는 `,` 목록 안의 `&`뿐입니다.
`.a, #x { & .b { } }`는 `:is(.a, #x) .b`가 되어 specificity가 `#x` 기준입니다. 그 밖에는 시각적 차이뿐입니다.

기계 검증은 `max-nesting-depth`입니다.

`__prose`, `__copy`, `__content`처럼 raw HTML wrapper가 owner boundary라면
같은 block 안에서 `& h2`, `& p`, `& > :first-child`를 씁니다.
raw HTML에는 클래스를 붙일 수 없어서 element selector가 유일한 수단입니다.
이 예외는 raw element에만 적용하고, 다른 project-owned class를 체이닝하는 근거로 쓰지 않습니다.

**Incorrect (중첩 block 안에서 다시 중첩 block을 열어 3단이 됨):**

```css
.pg_spikePanel__spreadButton {
	&.MuiButtonBase-root {
		&:hover {
			.pg_spikePanel__spreadBox {
				border-color: #9fadc7;
			}
		}
	}
}
```

**Incorrect (wrapper styling을 owner block 밖으로 흩뿌림):**

```css
.wg_entryDetail__prose h2 {
	margin: 24px 0 12px;
}

.wg_entryDetail__prose > :first-child {
	margin-top: 0;
}
```

**Correct (2단까지만 열고 owner block 안에 모음):**

```css
.pg_spikePanel__spreadButton {
	&:hover .pg_spikePanel__spreadBox {
		border-color: #9fadc7;
	}
}

.wg_entryDetail__prose {
	& h2 {
		margin: 24px 0 12px;
	}

	& > :first-child {
		margin-top: 0;
	}
}
```
