import { useState } from "react";

export default function ChatList() {

	return (
		<div style={{display: "flex", height: "100vh"}}>
			<div style={{width: "300px"}}>
				<h1>Menssagens</h1>
				<dir>
					<div>
						<p><strong>User:</strong> Hello, how are you?</p>
					</div>
					<div>
						<p><strong>User:</strong> Hello, how are you?</p>
					</div>
					<div>
						<p><strong>User:</strong> Hello, how are you?</p>
					</div>
					<div>
						<p><strong>User:</strong> Hello, how are you?</p>
					</div>
				</dir>
			</div>
		</div>
	)
}

