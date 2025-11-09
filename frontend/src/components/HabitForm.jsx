import { useState } from "react";
import { toast } from "react-hot-toast";

export default function HabitForm({ onHabitAdded }) {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		frequency: "per_day",
	});

	const handleFormChange = (e) => {
		const { name, type } = e.target;
		const value = type === "checkbox" ? e.target.checked : e.target.value;
		setFormData({ ...formData, [name]: value });
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/habits`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
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
				setFormData({ name: "", frequency: "per_day" });
				onHabitAdded?.();
			} else {
				toast.error(data.message || "Add habit failed");
			}
		} catch (error) {
			console.error("Add habit error:", error);
			toast.error("Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="bg-indigo-900 rounded-lg border border-violet-400 mt-4 sm:mt-6 lg:mt-0">
			<div className="bg-indigo-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-violet-400">
				<h3 className="text-lg sm:text-xl font-bold text-purple-100">Add New Habit</h3>
			</div>
			<div className="p-4 sm:p-6">
				<form onSubmit={handleFormSubmit}>
					<div className="mb-3 sm:mb-4">
						<label className="block text-violet-300 text-sm sm:text-base font-medium mb-1.5 sm:mb-2">Habit Name:</label>
						<input
							type="text"
							className="w-full px-3 py-2 text-sm sm:text-base border border-violet-400 rounded"
							placeholder="Enter habit name"
							name="name"
							value={formData.name}
							onChange={handleFormChange}
							disabled={submitting}
							required
						/>
					</div>

					<div className="mb-3 sm:mb-4">
						<label className="block text-violet-300 text-sm sm:text-base font-medium mb-1.5 sm:mb-2">Frequency:</label>
						<select
							className="w-full px-3 py-2 text-sm sm:text-base border border-violet-400 rounded"
							name="frequency"
							value={formData.frequency}
							onChange={handleFormChange}
							disabled={submitting}
						>
							<option value="per_day">Daily</option>
							<option value="per_week">Weekly</option>
							<option value="per_month">Monthly</option>
						</select>
					</div>

					<button
						type="submit"
						className={`w-full sm:w-auto px-4 py-2 text-sm sm:text-base border border-violet-400 rounded ${submitting ? 'bg-violet-800 text-gray-500' : 'bg-indigo-950 text-white hover:opacity-90'}`}
						disabled={submitting}
					>
						{submitting ? "Adding..." : "Add Habit"}
					</button>
				</form>
			</div>
		</div>
	);
}


