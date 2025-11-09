import Header from "../components/Header";

export default function Home() {
	return (
		<div>
			<Header />
			<h2 className="text-xl font-semibold">Welcome to the Home page</h2>
			<p className="mt-2 text-violet-300">This is the public home view.</p>
		</div>
	);
}
