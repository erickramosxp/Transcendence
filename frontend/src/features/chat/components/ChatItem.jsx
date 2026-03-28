
export default function ChatItem({chat, onCLick}) {


	return (
		<div onClick={onCLick}>
			<p>{chat.name}</p>
			<span>{chat.lastMessage}</span>
			<span>{chat.lastMessageTime}</span>
		</div>

	)
}
