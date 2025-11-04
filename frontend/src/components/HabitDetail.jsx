export default function HabitDetail({ habit }) {
	return (
		<div>
			<li className="border p-2 mb-2">
				<h4 className="font-semibold">{habit.name}</h4>
				<p>Frequency: {habit.frequency}</p>
				<p>Tracked: {habit.isTracked ? "Yes" : "No"}</p>
			</li>
		</div>
	);
}
