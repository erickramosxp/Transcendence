async function fetchLinkPreview(url) {
	try {
		const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
		const data = await response.json();
		const d = data.data;
		return {
			url: d.url,
			title: d.title || "Sem título",
			description: d.description || "",
			image: d.image?.url || null,
		};
	} catch (error) {
		console.error("Error fetching link preview:", error);
		return null;
	}
}

export default { fetchLinkPreview };
