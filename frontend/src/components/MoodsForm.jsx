import { useState } from "react";
import { toast } from "react-hot-toast";

export default function MoodsForm() {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		mood: "happy",
		notes: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			console.log("API URL:", import.meta.env.VITE_API_URL);
			console.log("Environment:", import.meta.env.MODE);

			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods`, {
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
				toast.success("Mood added successfully!");
				// reset form to defaults
				setFormData({ mood: "happy", notes: "" });
			} else {
				toast.error(data.message || "Add mood failed");
			}
		} catch (error) {
			console.error("Add mood error:", error);
			toast.error("Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			<form className="mt-4" onSubmit={handleSubmit}>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					disabled={submitting}
				>
					{submitting ? "Adding..." : "Add Mood"}
				</button>
			</form>
		</div>
	);
}
