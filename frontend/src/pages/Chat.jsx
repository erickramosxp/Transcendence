import { useState, useEffect, useCallback } from "react";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ChatList from "@/features/chat/components/ChatList";
import { cn } from "@/design-system/tokens/colors";
import { getMyChats } from "@/features/chat/services/chatService";
import { Loading } from "@/design-system";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export function Chat() {
	const { t } = useTranslation('chat');
	const [selectedChat, setSelectedChat] = useState(null);
    const [myChats, setMyChats] = useState([]);
    const [loadHeader, setLoadHeader] = useState(true);
    const [notFounded, setNotFounded] = useState(false);

	const refreshChats = useCallback(async () => {
		const resp = await getMyChats();
		setMyChats(resp.items ?? []);
	}, []);

	useEffect(() => {
		const fetchMyChats = async () => {
			try {
				await refreshChats();
				setNotFounded(false);
			} catch (err) {
				console.error(err);
				setNotFounded(true);
				toast.error(t("errors.load"));
			} finally {
				setLoadHeader(false);
			}
		};
		fetchMyChats();
	}, [t, refreshChats]);

	const handleChatCreated = useCallback(
		async (apiChat, meta) => {
			try {
				await refreshChats();
			} catch (e) {
				console.error(e);
				toast.error(t("errors.load"));
				return;
			}
			const name = meta?.peerLabel ?? apiChat?.chatName ?? undefined;
			setSelectedChat(name != null ? { ...apiChat, name } : apiChat);
			toast.success(t("list.add.createSuccess"));
		},
		[refreshChats, t],
	);

    if (loadHeader) {
        return <Loading size="lg" full={true} />;
    }

    if (notFounded) {
        return <div className="flex flex-1 items-center justify-center h-full">
            <p className="text-muted-foreground text-3xl text-center">
                {t("errors.load")}
            </p>
        </div>
    }

	return (
		<div className="ds-chat-layout">
			<aside
				className={cn(
					"ds-chat-sidebar",
					selectedChat && "hidden md:flex",
				)}
			>
				<ChatList
					myChats={myChats}
					selectedChat={selectedChat}
					onSelectChat={setSelectedChat}
					onChatCreated={handleChatCreated}
				/>
			</aside>
			<main
				className={cn(
					"ds-chat-main",
					!selectedChat && "hidden md:flex",
				)}
			>
				<ChatWindow currentChat={selectedChat} onBack={() => setSelectedChat(null)} />
			</main>
		</div>
	);
}
