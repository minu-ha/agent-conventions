---
title: Document Custom Types at the Top of the File
impact: MEDIUM-HIGH
impactDescription: 구현을 읽지 않아도 도메인 타입을 검색하고 이해할 수 있게 함
tags: typing, docs, interfaces
---

## Document Custom Types at the Top of the File

**Impact: MEDIUM-HIGH (구현을 읽지 않아도 도메인 타입을 검색하고 이해할 수 있게 함)**

API 생성 타입이 아닌 커스텀 `type`, `interface` 선언은 파일 상단에 모으고 JSDoc으로 의미를 설명합니다. 객체형 `type`, `interface`는 헤더에 `@summary`를 작성하고, 각 필드 바로 위 `@field` 블록 주석으로 필드 의미를 모두 명시합니다. 헤더에 여러 `@field` 또는 `@property`를 나열하는 예전 방식은 사용하지 않으며, 구현 중간에 타입 선언을 흩뿌리지 않습니다.

**Incorrect (구현 중간 선언 + 헤더에 필드 설명 나열):**

```ts
/**
 * @summary 엔트리 트리 사이드바 노드
 * @property id 노드 식별자
 * @property name 사이드바 표시 이름
 */
interface EntrySidebarNode {
  id: number;
  name: string;
}

const normalize = () => {
  interface LocalEntryNode {
    id: number;
    name: string;
  }
};
```

**Correct (파일 상단 배치 + 헤더 `@summary` + 필드별 `@field`):**

```ts
/**
 * @summary 엔트리 트리 사이드바 노드
 */
export interface EntrySidebarNode {
  /**
   * @field 노드 식별자
   */
  id: number;
  /**
   * @field 사이드바 표시 이름
   */
  name: string;
}
```
