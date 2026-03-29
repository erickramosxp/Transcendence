import ChatItem from "@/features/chat/components/ChatItem";
import { Separator } from "@/design-system/primitives/Separator";
import { Search } from "lucide-react";

export default function ChatList({friendsChat, setSelectedChat}) {

	return (
		<div style={{display: "flex", height: "100vh"}}>
			<div style={{width: "300px", padding: "10px", borderRight: "1px solid #ccc"}}>
				<h2 style={{padding: "10px"}}>Mensagens</h2>

				<div style={{ position: "relative", marginBottom: "10px" }}>
					<input
						type="text"
						placeholder="Buscar Conversas..."
						style={{
							width: "100%",
							padding: "10px 10px 10px 36px", // padding-left for icon
							border: "1px solid #ccc",
							borderRadius: "5px",
						}}
					/>
					<span
						style={{
							position: "absolute",
							left: "12px",
							top: "50%",
							transform: "translateY(-50%)",
							pointerEvents: "none",
							color: "#888",
						}}
					>
						<Search className="size-4" />
					</span>
				</div>
				<Separator />
				<div style={{marginTop: "10px"}}>
					{friendsChat.map((friend) => (
						<ChatItem key={friend.id} chat={friend} onCLick={() => setSelectedChat(friend)}/>
					))}
				</div>
			</div>
		</div>
	)
}

