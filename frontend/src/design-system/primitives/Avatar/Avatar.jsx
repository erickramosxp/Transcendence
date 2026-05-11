import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/design-system/tokens/colors";

function getInitials(name = "") {
	const names = name.trim().split(" ").filter(Boolean);

	if (names.length === 0) return "";
	if (names.length === 1) return names[0][0]?.toUpperCase();

	return ((names[0][0] || "") + (names[names.length - 1][0] || "")).toUpperCase();
}

const avatarSizes = {
	sm: "h-8 w-8 text-xs",
	md: "h-10 w-10 text-sm",
	lg: "h-14 w-14 text-lg",
	xl: "h-20 w-20 text-xl",
	xl2: "h-24 w-24 text-2xl",
	xl3: "h-28 w-28 text-3xl",
	xxl: "h-32 w-32 text-4xl",
};

const statusSizes = {
	sm: "h-2.5 w-2.5",
	md: "h-3 w-3",
	lg: "h-4 w-4",
	xl: "h-5 w-5",
	xl2: "h-5 w-5",
	xl3: "h-6 w-6",
	xxl: "h-6 w-6",
};

const statusColors = {
	online: "bg-online",
	offline: "bg-muted-foreground",
	busy: "bg-destructive",
};

function Avatar({ src, name, username, size = "md", className = "" }) {
	const [hasError, setHasError] = useState(false);
	const dimension = avatarSizes[size] || avatarSizes.md;

	const content = (
		<div
			className={cn(
				"relative flex items-center justify-center overflow-hidden rounded-full border border-border font-medium text-primary-foreground bg-gradient-btn-primary",
				dimension,
				className
			)}
		>
			{src && !hasError ? (
				<img
					src={src}
					alt={name}
					onError={() => setHasError(true)}
					className="block h-full w-full object-cover"
				/>
			) : (
				<span>{getInitials(name)}</span>
			)}
		</div>
	);

	if (username) {
		return <Link to={`/${username}`}>{content}</Link>;
	}

	return content;
}

function AvatarWithStatus({
	src,
	name,
	username,
	size = "md",
	status = "online",
	showStatus = true,
	className = "",
}) {
	return (
		<div className={cn("relative inline-block", className)}>
			<Avatar src={src} name={name} username={username} size={size} />
			{showStatus && (
				<span
					className={cn(
						"absolute bottom-0 right-0 rounded-full border-2 border-card",
						statusColors[status] || statusColors.offline,
						statusSizes[size] || statusSizes.md
					)}
				/>
			)}
		</div>
	);
}

export { Avatar, AvatarWithStatus };
