import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading({
	size = "md",
	full = false,
	className = ""
}) {
	const sizes = {
		sm: "h-4 w-4",
		md: "h-8 w-8",
		lg: "h-12 w-12",
		xl: "h-16 w-16"
	};

	const dimension = sizes[size] || sizes.md;

	// modo overlay (cobre o container pai)
	if (full) {
		return (
			<div className={`absolute inset-0 flex items-center justify-center ${className}`}>
				<Loader2 className={`${dimension} animate-spin`} />
			</div>
		);
	}

	// modo normal (inline)
	return (
		<div className={`flex items-center justify-center ${className}`}>
			<Loader2 className={`${dimension} animate-spin`} />
		</div>
	);
}
