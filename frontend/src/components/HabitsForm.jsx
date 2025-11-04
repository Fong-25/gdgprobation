import { useState } from "react";
import { toast } from "react-hot-toast";

export default function HabitsForm() {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		frequency: "per_day",
		isTracked: true,
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			console.log("API URL:", import.meta.env.VITE_API_URL);
			console.log("Environment:", import.meta.env.MODE);

			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/habits`, {
				method: "POST",
				credentials: "include", // important for JWT cookies
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			// try parse JSON but handle non-JSON (like HTML 404)
			let data = null;
			const text = await res.text();
			try {
				data = JSON.parse(text);
			} catch (err) {
				// not JSON — keep text for debugging
				data = { message: text };
			}

			if (res.ok) {
				toast.success("Add habit successful!");
				// reset form to defaults
				setFormData({ name: "", frequency: "per_day", isTracked: true });
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

	const handleChange = (e) => {
		const { name, type } = e.target;
		const value = type === "checkbox" ? e.target.checked : e.target.value;
		setFormData({ ...formData, [name]: value });
	};

	return (
		<div>
			<form className="mt-4" onSubmit={handleSubmit}>
				<div className="mb-4">
					<label className="block text-gray-700">Habit Name:</label>
					<input
						type="text"
						className="w-full px-3 py-2 border rounded"
						placeholder="Enter habit name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						disabled={submitting}
					/>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700">Frequency:</label>
					<select
						className="w-full px-3 py-2 border rounded"
						name="frequency"
						value={formData.frequency}
						onChange={handleChange}
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
						onChange={handleChange}
						disabled={submitting}
						className="mr-2"
					/>
					<label htmlFor="isTracked" className="text-gray-700">
						Track this habit
					</label>
				</div>

				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					disabled={submitting}
				>
					{submitting ? "Adding..." : "Add Habit"}
				</button>
			</form>
		</div>
	);
}
