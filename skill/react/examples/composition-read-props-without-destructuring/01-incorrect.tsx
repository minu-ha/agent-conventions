const WgUserCard = (props: WgUserCardProps) => {
// [!code error]
	const { label, onSave } = props;
// [!code error]
	return <button onClick={onSave}>{label}</button>;
};
