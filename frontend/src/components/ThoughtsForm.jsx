import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ThoughtsForm({ canAddToday = true, onAdded } ) {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		text: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			console.log("API URL:", import.meta.env.VITE_API_URL);
			console.log("Environment:", import.meta.env.MODE);

			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts`, {
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
				const newThought = data?.newThought || data?.thought || null;
				toast.success("Thought added successfully!");
				// reset form to defaults
				setFormData({ text: "" });
				// notify parent to refresh graph/state
				if (onAdded && newThought) onAdded(newThought);
			} else {
				toast.error(data.message || "Add thought failed");
			}
		} catch (error) {
			console.error("Add thought error:", error);
			toast.error("Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	const handleChange = (e) => {
		const { name, type } = e.target;
		let value = type === "checkbox" ? e.target.checked : e.target.value;

		// Limit text input to max 5 words
		if (name === "text" && type !== "checkbox") {
			const words = value.trim().split(/\s+/);
			if (words.length > 5) {
				value = words.slice(0, 5).join(" ");
				toast.error("Maximum 5 words allowed");
			}
		}

		setFormData({ ...formData, [name]: value });
	};

	return (
		<div className="max-w-7xl mx-auto mt-4 sm:mt-6">
			<form className="flex flex-col sm:flex-row gap-2 sm:gap-3" onSubmit={handleSubmit}>
				<input
					type="text"
					name="text"
					value={formData.text}
					onChange={handleChange}
					placeholder={canAddToday ? "Enter your thought (max 5 words)" : "You've already added a thought today"}
					className="flex-1 w-full px-3 py-2 text-sm sm:text-base border border-black rounded"
					disabled={submitting || !canAddToday}
				/>

				<button
					type="submit"
					className={`px-4 py-2 text-sm sm:text-base border border-black rounded whitespace-nowrap ${submitting || !canAddToday ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:opacity-90'}`}
					disabled={submitting || !canAddToday}
				>
					{submitting ? "Adding..." : (canAddToday ? "Add Thought" : "Already added today")}
				</button>
			</form>
		</div>
	);
}
