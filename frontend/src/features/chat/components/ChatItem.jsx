import { AvatarWithStatus } from "@/design-system/primitives/Avatar";

export default function ChatItem({chat, onCLick}) {

	return (
		<div
			onClick={onCLick}
			style={{
				border: "1px solid #ccc",
				borderRadius: "8px",
				padding: "12px",
				marginBottom: "10px",
				cursor: "pointer",
				display: "flex",
				alignItems: "center",
				gap: "12px"
			}}
		>
			<AvatarWithStatus
				src={chat.avatar}
				name={chat.name}
				status="online" // online | offline
				size="sm"
			/>
			<div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<p style={{ margin: 0 }}>{chat.name}</p>
					<span style={{ color: "#888", fontSize: "12px", marginLeft: "12px", whiteSpace: "nowrap" }}>
						{chat.lastMessageTime}
					</span>
				</div>
				<span style={{ color: "#555", fontSize: "14px" }}>{chat.lastMessage}</span>
			</div>
		</div>
	)
}
