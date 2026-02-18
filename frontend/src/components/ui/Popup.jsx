import React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";


function Popup({ open, onClose, children }) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black/40 flex justify-center items-center z-100" onClick={onClose}>
			<div className="h-100 w-400 bg-gradient-to-br from-[#edf2f8] via-[#dbe4f0] to-[#b7c9e1] dark:from-slate-950 dark:via-[#0f1824] dark:to-[#1e3048] rounded-lg p-6 shadow-xl max-w-md" onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-start mb-4">
					<div></div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="h-8 w-8 p-0 "
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				{children}
			</div>
		</div>
	);
}

export default Popup;
