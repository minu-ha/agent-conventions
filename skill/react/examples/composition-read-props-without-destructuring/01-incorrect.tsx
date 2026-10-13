const WgUserCard = (props: WgUserCardProps) => {
// [!code error]
	const { label, onSave } = props;
// [!code error]
	return <button type="button" onClick={onSave}>{label}</button>;
};
