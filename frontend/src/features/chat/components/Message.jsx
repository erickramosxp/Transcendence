
export default function Message ({message}) {

	return(
		<div>
			<strong>{message.sender}:</strong> {message.text}
			<br />
			<span className="text-xs text-gray-500">{message.timestamp}</span>
		</div>
	);
}
