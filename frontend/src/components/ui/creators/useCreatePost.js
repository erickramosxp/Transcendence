import { useState } from "react"

export function useCreatePost(onAddPost, onClose, postType) {

	const [text, setText] = useState("");
	const [file, setFile]= useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);


	function handleSubmit() {
		if (text.trim() === "") return;

		if ((postType === "photo" || postType === "video") && file == null) return;

		onAddPost({
			text: text,
			file: file,
			fileType: typeof postType === 'string' ? postType : (postType?.type || "")
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


