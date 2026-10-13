// [!code error]
// 편집을 취소했다가 다시 들어가면 지난 입력이 그대로 남음
return (
	<Fragment>
// [!code error]
		<Activity mode={isEditing ? "visible" : "hidden"}>
// [!code error]
			<PgProductEditorForm />
// [!code error]
		</Activity>
// [!code error]
		<Activity mode={isEditing ? "hidden" : "visible"}>
// [!code error]
			<PgProductPreviewPane />
// [!code error]
		</Activity>
	</Fragment>
);
