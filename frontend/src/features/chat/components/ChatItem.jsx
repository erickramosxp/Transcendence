
export default function ChatItem({chat, onCLick}) {

	return (
		<div
			onClick={onCLick}
			style={{
				border: "1px solid #ccc",
				borderRadius: "8px",
				padding: "12px",
				marginBottom: "10px",
				cursor: "pointer"
			}}
		>
			<p>{chat.name}</p>
			<span>{chat.lastMessage}</span>
			<span style={{ float: "right", color: "#888", fontSize: "12px" }}>{chat.lastMessageTime}</span>
		</div>

	)
}
