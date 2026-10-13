const WgUserCard = (props: WgUserCardProps) => {
// [!code ++]
	return <button onClick={props.onSave}>{props.label}</button>;
};
