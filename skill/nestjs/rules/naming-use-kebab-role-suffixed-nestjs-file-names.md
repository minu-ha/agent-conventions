---
title: Use Kebab-case Filenames With Nest Role Suffixes
titleKo: 파일 이름은 kebab-case에 Nest 역할 접미사
impact: HIGH
impactDescription: keeps NestJS file purpose obvious from the filename before the file is opened
tags: naming, files, suffixes
---

## Use Kebab-case Filenames With Nest Role Suffixes

**Impact: HIGH (keeps NestJS file purpose obvious from the filename before the file is opened)**

NestJS 파일명은 `kebab-case`를 사용하고 역할 suffix를 반드시 포함합니다.
변수, 함수, 메서드는 `camelCase`, 클래스와 타입, 인터페이스는 `PascalCase`,
상수는 `SCREAMING_SNAKE_CASE`를 유지해 파일명과 심볼 역할이 함께 읽히도록 합니다.

**Incorrect (파일 목적이나 심볼 규칙이 불분명함):**

```txt
UsersService.ts
users.ts
CreateUser.ts
```

**Correct (역할 suffix와 일관된 심볼 규칙을 유지):**

```txt
users.module.ts
users.controller.ts
users.service.ts
create-user.dto.ts
user-response.dto.ts
```
