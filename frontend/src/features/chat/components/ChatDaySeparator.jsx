export default function ChatDaySeparator({ label }) {
	if (!label) return null;
	return (
		<div className="ds-chat-day-wrap" role="separator" aria-label={label}>
			<span className="ds-chat-day-pill">{label}</span>
		</div>
	);
}
