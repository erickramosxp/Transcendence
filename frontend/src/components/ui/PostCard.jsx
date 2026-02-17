
function PostCard ({ post, onLike }) {
	return (
		<div>
			<p>{post.content}</p>
			{post.imageUrl && (
				<img 
					src={post.imageUrl} 
					alt="Post attachment" 
					style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }}
				/>
			)}
			<button onClick={() => onLike(post.id)}>
				Curtir ({post.likes})
			</button>
		</div>
	);
}

export default PostCard;
