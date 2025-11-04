import HabitsForm from "../components/HabitsForm";
import Header from "../components/Header";

export default function Logs() {
	return (
		<div>
			<Header />
			<h2 className="text-xl font-semibold">Logs Page</h2>
			<section className="mt-4">
				<h3>Moods</h3>
			</section>
			<section className="mt-4">
				<h3>Thoughts</h3>
			</section>
			<section className="mt-4">
				<h3>Habits</h3>
				<HabitsForm />
			</section>
		</div>
	);
}
