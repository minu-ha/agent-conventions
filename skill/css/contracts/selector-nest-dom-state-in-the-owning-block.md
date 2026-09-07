# Nest DOM State Pseudo-classes in the Owning Block

**Impact: MEDIUM (기본 모습과 상태 변화를 함께 읽고 수정자가 꺼져도 상호작용 표시를 유지합니다)**

DOM 상태 가상 클래스는 해당 요소의 **조건 없는 기본 클래스 블록** 안에 `&:`로 씁니다.
기본 모습과 상태 변화를 함께 읽도록 블록 바깥이나 수정자 블록에서 다시 열지 않습니다.

| 상황 | 작성 방법 |
| --- | --- |
| 도메인 상태와 무관한 `:hover`, `:focus-visible`, `:disabled` | 기본 블록에 둡니다. 수정자가 꺼졌을 때 상호작용 표시가 사라지지 않게 합니다 |
| 수정자가 켜졌을 때만 상호작용이 달라져야 한다는 제품 요구가 있음 | 수정자 안에 둘 수 있으며 그 예외를 적습니다. 포커스 표시 자체는 `a11y-always-provide-a-visible-focus-indicator`를 따릅니다 |
| 여러 상태가 같은 선언을 씀 | 상태마다 블록을 엽니다. `selector-do-not-group-classes-with-commas`에 따라 묶지 않습니다 |
| 조상의 DOM 상태가 자손을 바꿈 | 조상 블록에서 식별자가 같은 자손을 결합자 하나로 선택합니다 |
| 조상 상태를 자손 블록에서 읽거나 지역 변수로 전달함 | `:has()`도 쓰지 않습니다. 지역 변수는 `values-tokenize-repeated-visual-values` 규칙이 금지합니다 |

자손의 `:hover`는 포인터가 자손 위에 있을 때만 적용되므로 조상의 hover를 대신하지 못합니다.
자손 블록에서 조상 조건을 읽으면 조상을 옮길 때 스타일이 깨질 수 있습니다.
자손 기본 블록은 조상 규칙보다 **앞에** 둡니다.
뒤에 두면 낮은 명시도의 규칙이 나중에 나와 `no-descending-specificity`에 걸립니다.

| 기계 검증 | 검사 대상 |
| --- | --- |
| `selector-disallowed-list` | 최상위에 다시 선언한 상태 가상 클래스 |
| `property-disallowed-list` | 지역 변수 선언 |

**Incorrect (가상 클래스를 최상위 선택자로 다시 엽니다):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;
}

.wg_siteHeader__brandLink:hover {
	color: #0958d9;
}

.wg_siteHeader__brandLink:focus-visible {
	color: #0958d9;
	outline: 2px solid #1677ff;
}
```

**Correct (기본 블록 안에서 각 상태를 별도의 `&:` 블록으로 선언합니다):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;

	&:hover {
		color: #0958d9;
	}

	&:focus-visible {
		color: #0958d9;
		outline: 2px solid #1677ff;
	}
}
```

> 나머지 예시·예외는 [full rule](../rules/04-06-selector-nest-dom-state-in-the-owning-block.md)에 있습니다.
