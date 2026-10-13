// [!code ++]
// 편집을 취소하면 폼이 해제돼 다시 들어갈 때 빈 입력으로 시작
return (
	<Fragment>
{/* [!code ++] */}
		{isEditing && <PgProductEditorForm />}
{/* [!code ++] */}
		{!isEditing && <PgProductPreviewPane />}
	</Fragment>
);
