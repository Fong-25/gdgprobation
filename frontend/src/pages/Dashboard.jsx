import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import HabitDetail from "../components/HabitDetail.jsx";

export default function Dashboard() {
	const [habits, setHabits] = useState([]);

	useEffect(() => {
		fetchHabits();
	}, []);

	const fetchHabits = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/habits`, {
				method: "GET",
				credentials: "include", // important for JWT cookies
			});
			const data = await res.json();
			if (res.ok) {
				console.log("Fetched habits:", data);
				setHabits(Array.isArray(data.habits) ? data.habits : []);
			}
		} catch (error) {
			console.error("Fetch habits error:", error);
		}
	};

	return (
		<div>
			<Header />
			<h2 className="text-xl font-semibold">Dashboard</h2>
			<section className="mt-4">
				<h3>Moods</h3>
			</section>
			<section className="mt-4">
				<h3>Thoughts</h3>
			</section>
			<section className="mt-4">
				<h3>Habits</h3>
				<ul>
					{habits.map((habit) => (
						<HabitDetail key={habit.id} habit={habit} />
					))}
				</ul>
			</section>
		</div>
	);
}
