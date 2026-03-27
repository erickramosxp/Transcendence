import Textarea from "@/design-system/primitives/Textarea";
import { Button } from "@/design-system/primitives/Button";


export default function ChatWindow() {

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
			<div>
				<h1>Chat Window</h1>
			</div>
			<div style={{ flex: 1 }}>
				<div>
					<p>
						<strong>User:</strong> 
					</p>
				</div>
			</div>
			<div>
				<form>
					<Textarea maxLength={500} />
						<Button size="sm">
							Send
						</Button>
				</form>
			</div>
		</div>
	);
}
