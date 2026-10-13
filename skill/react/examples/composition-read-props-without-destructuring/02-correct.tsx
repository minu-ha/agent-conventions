const WgUserCard = (props: WgUserCardProps) => {
// [!code ++]
	return <button type="button" onClick={props.onSave}>{props.label}</button>;
};
