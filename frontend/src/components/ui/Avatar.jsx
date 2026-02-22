import { useState } from 'react'

function getInitials(name=""){
	const names = name.trim().split("");
	if (names.lenght === 1)
		return names[0][0]?.toUpperCase();
	return(
		(names[0][0] || "") +
		(names[names.length - 1][0] || "")
	).toUpperCase();
}

function Avatar ({src, name, size="md", className=""}){
	const [hasError, setHasError] = useState(false);

	const sizes = {
		sm: "h-8 w-8 text-xs",
		md: "h-10 w-10 text-sm",
		lg: "h-14 w-14 text-lg",
		xl: "h-20 w-20 text-xl",
	};

	const dimension = sizes[size] || sizes.md;

	return(
		<div
			className={`relative inline-flex items-center justify-center
			rounded-full text-
			bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091]  shadow-[#4a78b5]/50 h-9
			font-medium overflow-hidden
			${dimension}
			${className}
			`}
		>
			{src && !hasError ? (
				<img
					src={src}
					alt={name}
					onError={() => setHasError(true)}
					className="h-full w-full object-cover"
				/>
			):(
				<span>{getInitials(name)}</span>
			)}
		</div>
	);
}


function AvatarWithStatus({
  src,
  name,
  size = "md",
  status = "online", // online | offline | busy
  className = "",
}) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
  };

  const statusSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
    xl: "h-5 w-5",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar src={src} name={name} size={size} />

      <span
        className={`
          absolute bottom-0 right-0
          rounded-full border-2 border-white
          ${statusColors[status]}
          ${statusSizes[size]}
        `}
      />
    </div>
  );
}


export { Avatar, AvatarWithStatus };
