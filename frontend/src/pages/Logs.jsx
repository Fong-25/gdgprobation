import { useState } from "react";
import Header from "../components/Header";
import { toast } from "react-hot-toast";
import { MessageSquare, Heart, CheckSquare } from "lucide-react";
import { SidebarProvider } from "../contexts/SidebarContext";
import MoodGrid from "../components/MoodGrid";

export default function Logs() {
	const [submittingThought, setSubmittingThought] = useState(false);
	const [submittingHabit, setSubmittingHabit] = useState(false);
	const [thoughtData, setThoughtData] = useState({ text: "" });
	const [habitData, setHabitData] = useState({
		name: "",
	});

	const handleThoughtSubmit = async (e) => {
		e.preventDefault();
		setSubmittingThought(true);

		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(thoughtData),
			});

			let data = null;
			const text = await res.text();
			try {
				data = JSON.parse(text);
			} catch (err) {
				data = { message: text };
			}

			if (res.ok) {
				toast.success("Thought added successfully!");
				setThoughtData({ text: "" });
			} else {
				toast.error(data.message || "Add thought failed");
			}
		} catch (error) {
			console.error("Add thought error:", error);
			toast.error("Something went wrong");
		} finally {
			setSubmittingThought(false);
		}
	};

	const handleHabitSubmit = async (e) => {
		e.preventDefault();
		setSubmittingHabit(true);

		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/habits`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(habitData),
			});

			let data = null;
			const text = await res.text();
			try {
				data = JSON.parse(text);
			} catch (err) {
				data = { message: text };
			}

			if (res.ok) {
				toast.success("Habit added successfully!");
				setHabitData({ name: "" });
			} else {
				toast.error(data.message || "Add habit failed");
			}
		} catch (error) {
			console.error("Add habit error:", error);
			toast.error("Something went wrong");
		} finally {
			setSubmittingHabit(false);
		}
	};

	const handleThoughtChange = (e) => {
		const { name, value } = e.target;
		let newValue = value;

		if (name === "text") {
			const words = value.trim().split(/\s+/);
			if (words.length > 5) {
				newValue = words.slice(0, 5).join(" ");
				toast.error("Maximum 5 words allowed");
			}
		}

		setThoughtData({ ...thoughtData, [name]: newValue });
	};

	const handleHabitChange = (e) => {
		const { name, value } = e.target;
		setHabitData({ ...habitData, [name]: value });
	};

	return (
		<SidebarProvider>
			<div>
				<Header />
				<main className="flex-1 p-4 sm:p-6 w-full min-w-0 max-w-7xl mx-auto">
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-black">Add New Entries</h2>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
					{/* Thought Form */}
					<div className="bg-white rounded-lg border border-black p-4 sm:p-6">
						<div className="flex items-center gap-2 mb-4">
							<MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
							<h3 className="text-xl sm:text-2xl font-bold text-black">Add Thought</h3>
						</div>
						<p className="text-xs sm:text-sm text-gray-700 mb-4">Share your thoughts (maximum 5 words)</p>
						
						<form onSubmit={handleThoughtSubmit}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">Your Thought:</label>
								<input
									type="text"
									name="text"
									value={thoughtData.text}
									onChange={handleThoughtChange}
									placeholder="Enter your thought (max 5 words)"
									className="w-full px-3 py-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
									disabled={submittingThought}
								/>
							</div>

							<button
								type="submit"
								className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
								disabled={submittingThought}
							>
								{submittingThought ? "Adding..." : "Add Thought"}
							</button>
						</form>
					</div>

					{/* Habit Form */}
					<div className="bg-white rounded-lg border border-black p-4 sm:p-6">
						<div className="flex items-center gap-2 mb-4">
							<CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
							<h3 className="text-xl sm:text-2xl font-bold text-black">Add Habit</h3>
						</div>
						<p className="text-xs sm:text-sm text-gray-700 mb-4">Create a new habit to track</p>
						
						<form onSubmit={handleHabitSubmit}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">Habit Name:</label>
								<input
									type="text"
									name="name"
									value={habitData.name}
									onChange={handleHabitChange}
									placeholder="Enter habit name"
									className="w-full px-3 py-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
									disabled={submittingHabit}
								/>
							</div>

							<button
								type="submit"
								className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
								disabled={submittingHabit}
							>
								{submittingHabit ? "Adding..." : "Add Habit"}
							</button>
						</form>
					</div>

					{/* Mood Form */}
					<div className="bg-white rounded-lg border border-black p-4 sm:p-6 lg:col-span-2">
						<div className="flex items-center gap-2 mb-4">
							<Heart className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
							<h3 className="text-xl sm:text-2xl font-bold text-black">Log Mood</h3>
						</div>
						<p className="text-xs sm:text-sm text-gray-700 mb-4">Click anywhere on the grid to log your current mood</p>
						
						<MoodGrid />
					</div>
				</div>
			</main>
		</div>
		</SidebarProvider>
	);
}
