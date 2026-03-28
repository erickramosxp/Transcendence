import ChatItem from "@/features/chat/components/ChatItem";

export default function ChatList({friendsChat, setSelectedChat}) {

	return (
		<div style={{display: "flex", height: "100vh"}}>
			<div style={{width: "300px"}}>
				<h2>Menssagens</h2>

				<input type="text" placeholder="Search" />
				<div>
					{friendsChat.map((friend) => (
						<ChatItem key={friend.id} chat={friend} onCLick={() => setSelectedChat(friend)}/>
					))}
				</div>
			</div>
		</div>
	)
}

