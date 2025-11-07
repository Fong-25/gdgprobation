import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Header() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");

	const linkClass = (isActive) =>
		`mr-6 px-3 py-2 rounded ${isActive ? "bg-white text-black" : "text-white/90 hover:text-white"
		}`;

	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const response = await fetch("http://localhost:5000/api/auth/me", {
					credentials: "include",
				});

				if (response.ok) {
					const data = await response.json();
					setUsername(data.username);
				}
			} catch (error) {
				console.error("Failed to fetch user:", error);
			}
		};

		fetchCurrentUser();
	}, []);

	const handleLogout = async () => {
		try {
			const response = await fetch("http://localhost:5000/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});

			if (response.ok) {
				toast.success("Logged out successfully!");
				navigate("/login");
			} else {
				toast.error("Logout failed");
			}
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("An error occurred during logout");
		}
	};

	return (
		<header className="sticky top-0 z-50 bg-primary text-white p-4 flex items-center justify-between bg-blue-600 shadow-md">
			<div className="flex items-center gap-4">
				<h1 className="text-4xl font-bold">
					<NavLink to={"/home"}>Eunoia</NavLink>
				</h1>
				{username && (
					<span className="text-lg text-white/90">
						Welcome, <span className="font-semibold">{username}</span>
					</span>
				)}
			</div>

			<div className="flex items-center gap-4">
				<nav>
					{/* <NavLink to="/home" className={({ isActive }) => linkClass(isActive)}>
						Home
					</NavLink> */}
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

				<button
					onClick={handleLogout}
					className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors"
				>
					Logout
				</button>
			</div>
		</header>
	);
}
