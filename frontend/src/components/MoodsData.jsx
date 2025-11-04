import { useEffect, useState } from "react";

export default function MoodsData() {
	const [moods, setMoods] = useState([]);
	const [loading, setLoading] = useState(true);

	const moodEmojis = {
		happy: "😊",
		sad: "😢",
		anxious: "😰",
		calm: "😌",
		excited: "🤩",
		angry: "😠",
		tired: "😴",
	};

	useEffect(() => {
		fetchMoods();
	}, []);

	const fetchMoods = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods`, {
				method: "GET",
				credentials: "include",
			});
			const data = await res.json();
			if (res.ok) {
				setMoods(Array.isArray(data.moods) ? data.moods : []);
			}
		} catch (error) {
			console.error("Fetch moods error:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div className="text-gray-500">Loading moods...</div>;
	}

	return (
		<div>
			<h3 className="text-lg font-semibold mb-4">Your Moods</h3>
			{moods.length === 0 ? (
				<p className="text-gray-500">
					No moods recorded yet. Add some in the Logs section!
				</p>
			) : (
				<ul className="space-y-2">
					{moods.map((mood) => (
						<li key={mood.id} className="p-4 bg-white border rounded shadow-sm">
							<div className="flex items-center gap-2">
								<span className="text-2xl">
									{moodEmojis[mood.mood] || "😐"}
								</span>
								<span className="text-lg font-medium capitalize">
									{mood.mood}
								</span>
							</div>
							{mood.notes && <p className="text-gray-700 mt-2">{mood.notes}</p>}
							<p className="text-sm text-gray-500 mt-2">
								{new Date(mood.createdAt).toLocaleDateString()}
							</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
