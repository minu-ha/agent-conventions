// page/profile/pg-profile.tsx
const handleNextClick = () => {
// [!code ++]
	setPage((previous) => (previous + 1) % pageCount);
};
