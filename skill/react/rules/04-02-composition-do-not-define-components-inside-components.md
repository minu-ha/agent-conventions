---
title: Do Not Define Components Inside Components
titleKo: 컴포넌트 안에서 컴포넌트를 정의하지 않습니다
impact: HIGH
impactDescription: 렌더마다 컴포넌트 타입을 다시 만들어 생기는 재마운트와 상태 초기화를 막습니다
appliesWhen:
  - 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때
  - 재렌더 시 재마운트·focus 초기화 징후를 다룰 때
tags: composition, perf
---

## Do Not Define Components Inside Components

**Impact: HIGH (렌더마다 컴포넌트 타입을 다시 만들어 생기는 재마운트와 상태 초기화를 막습니다)**

컴포넌트 본문 안에서 다른 컴포넌트를 새로 정의하지 않습니다.
부모가 다시 렌더될 때마다 자식 컴포넌트 타입도 새로 만들어져
재마운트, 포커스 초기화, 애니메이션 재시작, 이펙트 재실행이 생깁니다.

로컬에서 JSX 조각을 재사용하려면 보조 함수 호출로 남기거나,
독립 컴포넌트로 빼고 프롭스를 전달합니다.

**Incorrect (렌더마다 새 컴포넌트 타입을 생성):**

```tsx
export const WgUserProfileCard = (props: WgUserProfileCardProps) => {
	const Avatar = () => {
		return (
			<img
				className={clsx(
					"wg_userProfileAvatar__image",
					props.theme === "dark" && "wg_userProfileAvatar__image--dark",
				)}
				src={props.user.avatarUrl}
			/>
		);
	};

	return (
		<section>
			<Avatar />
		</section>
	);
};
```

**Correct (컴포넌트를 바깥으로 분리하고 프롭스로 전달):**

```tsx
/**
 * 사용자 프로필 아바타 프롭스
 */
export interface WgUserProfileAvatarProps {
	/**
	 * 어두운 배경에서 쓸지
	 */
	theme: "dark" | "light";
	/**
	 * 아바타 이미지 주소
	 */
	src: string;
}

export const WgUserProfileAvatar = (props: WgUserProfileAvatarProps) => {
	return (
		<img
			className={clsx(
				"wg_userProfileAvatar__image",
				props.theme === "dark" && "wg_userProfileAvatar__image--dark",
			)}
			src={props.src}
		/>
	);
};

export const WgUserProfileCard = (props: WgUserProfileCardProps) => {
	return (
		<section>
			<WgUserProfileAvatar src={props.user.avatarUrl} theme={props.theme} />
		</section>
	);
};
```
