import { useState } from "react"

export function useCreatePost(onAddPost, onClose) {

	const [text, setText] = useState("");
	const [file, setFile]= useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);


	function handleSubmit() {
		if (text.trim() === "") return ;

		onAddPost({
			text: text,
			file: file
		});
		setText("");
		setFile(null);
		onClose();
	}

	function handleChange(e){
		const value = e.target.value;
		setText(value);
		const match = value.match(/:(\w*)$/);

		if(match){
			setShowEmojiPicker(true);
		}else{
			setShowEmojiPicker(false);
		}
	}

	function handleEmojiSelect(emojiData){
		setText(prev => prev.replace(/:(\w*)$/, "") + emojiData.emoji);
	}

	return { text, setText,
			 file, setFile,
			 showEmojiPicker,
			 handleSubmit,
			 handleChange,
			 handleEmojiSelect
			};
}


