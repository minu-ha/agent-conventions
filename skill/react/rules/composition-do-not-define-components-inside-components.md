---
title: Do Not Define Components Inside Components
impact: HIGH
impactDescription: prevents remount bugs and hidden state resets caused by recreating component types every render
appliesWhen: >-
  컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가·이동하거나 재렌더 시 remount·focus reset 징후를 다룬다.
tags: composition, components, remount, performance
---

## Do Not Define Components Inside Components

**Impact: HIGH (prevents remount bugs and hidden state resets caused by recreating component types every render)**

컴포넌트 본문 안에서 다른 컴포넌트를 새로 정의하지 않습니다.
parent가 다시 렌더될 때마다 child component type도 새로 만들어져 remount, focus reset, animation restart,
effect 재실행이 생길 수 있습니다.
로컬에서 JSX 조각을 재사용하고 싶다면 그냥 helper 함수 호출로 남기거나, 독립 component로 빼고 props를 전달합니다.

**Incorrect (렌더마다 새 component type을 생성):**

```tsx
export const UserProfileCard = (props: UserProfileCardProps) => {
	const { theme, user } = props;

	const Avatar = () => {
		return <img className={theme === "dark" ? "avatar-dark" : "avatar-light"} src={user.avatarUrl} />;
	};

	return (
		<section>
			<Avatar />
		</section>
	);
};
```

**Correct (component를 바깥으로 분리하고 props로 전달):**

```tsx
export interface UserProfileAvatarProps {
	theme: "dark" | "light";
	src: string;
}

export const UserProfileAvatar = (props: UserProfileAvatarProps) => {
	const { theme, src } = props;
	return <img className={theme === "dark" ? "avatar-dark" : "avatar-light"} src={src} />;
};

export const UserProfileCard = (props: UserProfileCardProps) => {
	const { theme, user } = props;

	return (
		<section>
			<UserProfileAvatar src={user.avatarUrl} theme={theme} />
		</section>
	);
};
```
