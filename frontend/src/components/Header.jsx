import { NavLink } from "react-router-dom";

export default function Header() {
	const linkClass = (isActive) =>
		`mr-6 px-3 py-2 rounded ${
			isActive ? "bg-white text-black" : "text-white/90 hover:text-white"
		}`;

	return (
		<header className="bg-primary text-white p-4 flex items-center justify-between bg-blue-600">
			<h1 className="text-2xl font-bold">Eunoia</h1>

			<nav>
				<NavLink to="/home" className={({ isActive }) => linkClass(isActive)}>
					Home
				</NavLink>
				<NavLink
					to="/dashboard"
					className={({ isActive }) => linkClass(isActive)}
				>
					Dashboard
				</NavLink>
				<NavLink to="/logs" className={({ isActive }) => linkClass(isActive)}>
					Logs
				</NavLink>
			</nav>
		</header>
	);
}
