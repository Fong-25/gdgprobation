import { useState } from "react";
import { toast } from "react-hot-toast";

export default function HabitForm({ onHabitAdded }) {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		frequency: "per_day",
		isTracked: true,
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
				setFormData({ name: "", frequency: "per_day", isTracked: true });
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
		<div className="bg-white rounded-xl shadow-md overflow-hidden border border-black mt-6 lg:mt-0">
			<div className="bg-gray-50 px-6 py-4 border-b border-black">
				<h3 className="text-xl font-bold text-black">Add New Habit</h3>
			</div>
			<div className="p-6">
				<form onSubmit={handleFormSubmit}>
					<div className="mb-4">
						<label className="block text-gray-700 font-medium mb-2">Habit Name:</label>
						<input
							type="text"
							className="w-full px-3 py-2 border border-black rounded"
							placeholder="Enter habit name"
							name="name"
							value={formData.name}
							onChange={handleFormChange}
							disabled={submitting}
							required
						/>
					</div>

					<div className="mb-4">
						<label className="block text-gray-700 font-medium mb-2">Frequency:</label>
						<select
							className="w-full px-3 py-2 border border-black rounded"
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

					<div className="mb-4 flex items-center">
						<input
							id="isTracked"
							name="isTracked"
							type="checkbox"
							checked={formData.isTracked}
							onChange={handleFormChange}
							disabled={submitting}
							className="mr-2 w-4 h-4"
						/>
						<label htmlFor="isTracked" className="text-gray-700">Track this habit</label>
					</div>

					<button
						type="submit"
						className={`px-4 py-2 border border-black rounded ${submitting ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:opacity-90'}`}
						disabled={submitting}
					>
						{submitting ? "Adding..." : "Add Habit"}
					</button>
				</form>
			</div>
		</div>
	);
}


