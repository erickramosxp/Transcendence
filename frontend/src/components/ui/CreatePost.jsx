import { useState } from "react"
import { Button } from "./Button";
import { Input } from "./Input";

function CreatePost({ onAddPost}){
	const [text, setText] = useState("");

	function handleSubimit() {
		if (text.trim() === "") return ;

		onAddPost(text);
		console.log(text);
		setText("");
	}

	return (
		<div>
			<Input
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="O que você está pensando?"
			/>
			<Button  onClick={handleSubimit}>
				Postar
			</Button>
		</div>
	);
}

export default CreatePost;
