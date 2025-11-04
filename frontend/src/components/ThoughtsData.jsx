import { useEffect, useState } from "react";

export default function ThoughtsData() {
	const [thoughts, setThoughts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchThoughts();
	}, []);

	const fetchThoughts = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts`, {
				method: "GET",
				credentials: "include",
			});
			const data = await res.json();
			if (res.ok) {
				setThoughts(Array.isArray(data.thoughts) ? data.thoughts : []);
			}
		} catch (error) {
			console.error("Fetch thoughts error:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div className="text-gray-500">Loading thoughts...</div>;
	}

	return (
		<div>
			<h3 className="text-lg font-semibold mb-4">Your Thoughts</h3>
			{thoughts.length === 0 ? (
				<p className="text-gray-500">
					No thoughts yet. Add some in the Logs section!
				</p>
			) : (
				<ul className="space-y-2">
					{thoughts.map((thought) => (
						<li
							key={thought.id}
							className="p-4 bg-white border rounded shadow-sm"
						>
							<p className="text-gray-800">{thought.text}</p>
							<p className="text-sm text-gray-500 mt-2">
								{new Date(thought.createdAt).toLocaleDateString()}
							</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
