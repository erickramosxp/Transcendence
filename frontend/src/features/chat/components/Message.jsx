import React from "react";

export default function Message({ currentUserId, message }) {
	const isMine =
		String(message.senderId) === String(currentUserId) || message.sender === "me";
	return (
		<div
			style={{
				display: "flex",
				justifyContent: isMine ? "flex-end" : "flex-start",
				marginBottom: 10,
				padding: 15,
			}}
		>
			<div
				style={{
					maxWidth: "60%",
					background: isMine ? "#f1f0f0" : "#f1f0f0",
					color: isMine ? "#323232" : "#323232",
					borderRadius: 18,
					padding: "10px 18px",
					borderTopLeftRadius: isMine ? 18 : 8,
					borderTopRightRadius: isMine ? 8 : 18,
					boxShadow: "0 1px 7px 0 rgba(0,0,0,0.10)",
					position: "relative",
					textAlign: "left",
					alignSelf: isMine ? "flex-end" : "flex-start",
				}}
			>
				<div style={{ whiteSpace: "pre-wrap", fontSize: 15 }}>
					{message.text}
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "center",
						marginTop: 5,
						gap: 4,
					}}
				>
					<span
						style={{
							fontSize: 12,
							color: isMine ? "#8fa4c5" : "#8fa4c5"
						}}
					>
						{message.timestamp}
					</span>
					{/* Show checkmark if sent by user */}
					{isMine && (
						<span style={{ color: "#8fa4c5", fontSize: 14, marginLeft: 2 }}>
							&#10003;&#10003;
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
