const visibleTabs = canManageItems
	? canInviteMembers
		? ["overview", "items", "members"]
		: ["overview", "items"]
	: canInviteMembers
		? ["overview", "members"]
		: ["overview"];
