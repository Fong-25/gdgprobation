import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function Logs() {
	return (
		<div>
			<Header />
			<div className="flex">
				<Sidebar mode="forms" />
				<main className="flex-1 p-6">
					<h2 className="text-xl font-semibold mb-4">Logs</h2>

					{/* Nested route content will render here */}
					<Outlet />
				</main>
			</div>
		</div>
	);
}
