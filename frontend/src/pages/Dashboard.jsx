import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { SidebarProvider } from "../contexts/SidebarContext";

export default function Dashboard() {
	return (
		<SidebarProvider>
			<div>
				<Header />
				<div className="flex">
					<Sidebar mode="data" />
					<main className="flex-1 p-4 sm:p-6 w-full min-w-0">
						<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-black">Dashboard</h2>

						{/* Nested route content will render here */}
						<Outlet />
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
