// [!code error]
import type {ButtonProps} from "@mui/material";

// [!code error]
const handleSubmitClick: ButtonProps["onClick"] = (event) => {
	event.preventDefault();
};
