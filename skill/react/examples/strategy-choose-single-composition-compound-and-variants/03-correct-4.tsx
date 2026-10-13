// component/widget/profile-dialog/wg-profile-dialog.tsx
import {WgProfileDialogBody} from "@/component/widget/profile-dialog/_wg-profile-dialog-body";
import {WgProfileDialogHeader} from "@/component/widget/profile-dialog/_wg-profile-dialog-header";
import {WgProfileDialogRoot} from "@/component/widget/profile-dialog/_wg-profile-dialog-root";

export const WgProfileDialog = {
	Root: WgProfileDialogRoot,
	Header: WgProfileDialogHeader,
	Body: WgProfileDialogBody,
} as const;
