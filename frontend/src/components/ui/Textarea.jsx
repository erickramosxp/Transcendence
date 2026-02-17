import * as React from "react";
import { cn } from "../utils/colors";

function Textarea({className, ...props}) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 arial-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color, box-shadow] outline-none focus-visible:ring-[3px] disable:cursor-not-allowed disable:opacity-50 md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export default Textarea;
