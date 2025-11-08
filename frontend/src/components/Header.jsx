import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSidebar } from "../contexts/SidebarContext";

export default function Header() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const { isMobileOpen, setIsMobileOpen } = useSidebar();

	const linkClass = (isActive) =>
		`px-3 py-2 rounded ${isActive ? "bg-white text-black" : "text-white/90 hover:text-white"
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
		<header className="sticky top-0 z-50 bg-primary text-white p-3 sm:p-4 bg-blue-600 shadow-md">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 sm:gap-3 flex-1">
					{/* Sidebar Toggle Button */}
					<button
						onClick={() => setIsMobileOpen(!isMobileOpen)}
						className="lg:hidden p-2 text-white hover:bg-white/10 rounded transition-colors"
						aria-label="Toggle sidebar"
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{isMobileOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
						<NavLink to={"/home"}>Eunoia</NavLink>
					</h1>
					{username && (
						<span className="hidden sm:block text-sm sm:text-base lg:text-lg text-white/90">
							Welcome, <span className="font-semibold">{username}</span>
						</span>
					)}
				</div>

				{/* Navigation - Always Visible */}
				<div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
					<nav className="flex items-center gap-2 sm:gap-3 lg:gap-4">
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
						className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base font-medium rounded transition-colors"
					>
						Logout
					</button>
				</div>
			</div>
		</header>
	);
}
