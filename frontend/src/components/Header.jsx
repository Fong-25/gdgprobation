import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSidebar } from "../contexts/SidebarContext";
import { MoonStar } from "lucide-react";

export default function Header() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const { isMobileOpen, setIsMobileOpen } = useSidebar();

	const linkClass = (isActive) =>
		`sm:px-3 sm:py-2 px-1.5 py-1 rounded ${isActive ? "text-indigo-900 bg-purple-100" : "text-purple-100/90 hover:text-violet-200"
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
		<header className="sticky top-0 z-50 text-purple-100 p-3 sm:p-4 bg-blue-600 shadow-md h-16">
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2 sm:gap-2 flex-1">
					{/* Sidebar Toggle Button */}
					<button
						onClick={() => setIsMobileOpen(!isMobileOpen)}
						className="lg:hidden p-2 text-purple-100 hover:bg-indigo-900/10 rounded transition-colors"
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
					<h1 className="font-['Beau_Rivage'] text-2xl sm:text-3xl lg:text-4xl font-bold">
						<NavLink
							to={"/home"}
							className="flex gap-2"
						>
							<MoonStar className="w-auto h-auto text-fuchsia-300" />
							Eunoia
						</NavLink>
					</h1>
					{username && (
						<span className="hidden sm:block text-sm sm:text-base lg:text-lg text-purple-100/90">
							Welcome, <span className="font-semibold">{username}</span>
						</span>
					)}
				</div>

				{/* Navigation - Always Visible */}
				<div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
					<nav className="flex items-center gap-2 sm:gap-2 lg:gap-4">
						<NavLink to="/logs" className={({ isActive }) => linkClass(isActive)}>
							Logs
						</NavLink>
						<NavLink
							to="/dashboard"
							className={({ isActive }) => linkClass(isActive)}
						>
							Dashboard
						</NavLink>
					</nav>

					<button
						onClick={handleLogout}
						className="px-3 py-2 bg-red-500 hover:bg-red-600 text-purple-100 text-sm font-medium rounded transition-colors"
					>
						Logout
					</button>
				</div>
			</div>
		</header>
	);
}
