import React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { Separator } from "./Separator"


function Popup({ open, onClose, children }) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" onClick={onClose}>
			<div className="bg-gradient-to-br from-[#edf2f8] via-[#dbe4f0] to-[#b7c9e1] dark:from-slate-950 dark:via-[#0f1824] dark:to-[#1e3048] rounded-lg px-2 py-6 sm:px-6 shadow-xl max-w-[520px] w-[95vw] sm:w-full" onClick={(e) => e.stopPropagation()}>
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
				<div>
					<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
						Criar publicação
					</h2>
					<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
						Compartilhe algo com sua comunidade
					</p>
					<div className="relative my-5 sm:my-6">
						<Separator />
						<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 sm:px-4 text-xs sm:text-sm text-slate-500">

						</span>
					</div>

				</div>
				{children}
			</div>
		</div>
	);
}

export default Popup;
