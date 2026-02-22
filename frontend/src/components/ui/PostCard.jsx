import React from "react";
import { yaleBlue } from "../utils/colors";
import { Heart, MessageSquare } from "lucide-react";
import { Avatar } from "../ui/Avatar"

function PostCard({ post, onLike }) {

	function getRelativeTime(date_time) {
		const now = Date.now();
		const diff = now - date_time;

		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0)
			return `há ${days} dia${days > 1 ? 's' : ''}`;
		if (hours > 0)
			return `há ${hours} hora${hours > 1 ? 's' : ''}`;
		if (minutes)
			return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
		return `há poucos segundos`;
	}

	return (

		<div className="bg-white rounded-2xl shadow-md p-4">
			<div className="flex gap-4">
				<Avatar
					src={post.userPhoto}
					name={post.username}
					size="lg"
				/>
				<div className="flex-1">
					<div className="flex items-center gap-2 text-sm">
						<span className={yaleBlue.text.hover}>
							{post.name}
						</span>

						<span className="text-slate-500">
							@{post.username}
						</span>

						<span className="text-slate-400">
							{getRelativeTime(post.date_time)}
						</span>
					</div>

					<div className="mt-2 text-stone-700 leading-relaxed">
						{post.content}
					</div>

					{post.imageUrl && (
						<img
							src={post.imageUrl}
							alt="Post attachment"
							style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }}
						/>
					)}
					<div className="flex items-center gap-6 mt-3 text-slate-500">
						<button
							onClick={() => onLike(post.id)}
							className={`flex items-center gap-2 text-sm transition-all hover:scale-105 ${post.isLiked
								? 'text-pink-600 dark:text-pink-400'
								: 'text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400'
								}`}
						>
							<Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
							{post.likes}
						</button>
						<button
							// onClick={() => setShowComments(!showComments)}
							className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#4a78b5] dark:hover:text-[#6e93c4] transition-all hover:scale-105"
						>
							<MessageSquare className="h-5 w-5" />
							{/* <span className="font-medium">{comments.length}</span> */}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

			export default PostCard;
