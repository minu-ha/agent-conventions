const WgUserCard = ({ label, onSave }: WgUserCardProps) => {
	return <button onClick={onSave}>{label}</button>;
};
