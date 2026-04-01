---
title: Document Custom Types at the Top of the File
impact: MEDIUM-HIGH
impactDescription: keeps domain-specific types searchable and understandable without reading implementations
tags: typing, docs, interfaces
---

## Document Custom Types at the Top of the File

**Impact: MEDIUM-HIGH (keeps domain-specific types searchable and understandable without reading implementations)**

API 생성 타입이 아닌 커스텀 `type`, `interface` 선언은 파일 상단에 모으고 JSDoc으로 의미를 설명합니다. 객체형 타입은 `@property`로 필드 뜻을 적고, 구현 중간에 타입 선언을 흩뿌리지 않습니다.

**Incorrect (의미 설명 없이 구현 중간에 타입 선언):**

```ts
const normalize = () => {
  interface EntryNode {
    id: number;
    name: string;
  }
};
```

**Correct (파일 상단에서 타입과 의미를 먼저 고정):**

```ts
/**
 * @summary 엔트리 트리 사이드바 노드
 * @property id 노드 식별자
 * @property name 사이드바 표시 이름
 */
export interface EntrySidebarNode {
  id: number;
  name: string;
}
```
