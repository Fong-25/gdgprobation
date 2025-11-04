import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function Dashboard() {
	return (
		<div>
			<Header />
			<div className="flex">
				<Sidebar mode="data" />
				<main className="flex-1 p-6">
					<h2 className="text-xl font-semibold mb-4">Dashboard</h2>

					{/* Nested route content will render here */}
					<Outlet />
				</main>
			</div>
		</div>
	);
}
