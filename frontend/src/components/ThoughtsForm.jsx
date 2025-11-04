import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ThoughtsForm() {
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
				toast.success("Thought added successfully!");
				// reset form to defaults
				setFormData({ text: "" });
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
		<div>
			<form className="mt-4" onSubmit={handleSubmit}>
				<input
					type="text"
					name="text"
					value={formData.text}
					onChange={handleChange}
					placeholder="Enter your thought (max 5 words)"
					className="w-full px-3 py-2 border rounded mb-4"
					disabled={submitting}
				/>

				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					disabled={submitting}
				>
					{submitting ? "Adding..." : "Add Thought"}
				</button>
			</form>
		</div>
	);
}
