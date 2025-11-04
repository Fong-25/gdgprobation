import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar({ mode = "forms" }) {
	const location = useLocation();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const isFormsMode = mode === "forms";
	const basePath = isFormsMode ? "/logs" : "/dashboard";
	const title = isFormsMode ? "Add New" : "View Data";

	// Check if a path segment is active
	const isPathActive = (segment) => {
		return location.pathname.includes(`/${segment}`);
	};

	return (
		<aside
			className={`sticky top-16 self-start bg-gray-100 h-[calc(100vh-4rem)] p-4 transition-all duration-300 ${
				isCollapsed ? "w-16" : "w-64"
			}`}
		>
			<div className="flex items-center justify-between mb-4">
				{!isCollapsed && <h2 className="text-xl font-bold">{title}</h2>}
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
					title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					<svg
						className={`w-5 h-5 transition-transform ${
							isCollapsed ? "rotate-180" : ""
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
						/>
					</svg>
				</button>
			</div>
			<nav className="flex flex-col gap-2">
				<NavLink
					to={`${basePath}/thoughts`}
					className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
						isPathActive("thoughts")
							? "bg-blue-500 text-white"
							: "bg-white text-gray-700 hover:bg-gray-200"
					}`}
					title={isCollapsed ? "Thoughts" : ""}
				>
					<svg
						className="w-5 h-5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
						/>
					</svg>
					{!isCollapsed && <span>Thoughts</span>}
				</NavLink>
				<NavLink
					to={`${basePath}/moods`}
					className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
						isPathActive("moods")
							? "bg-blue-500 text-white"
							: "bg-white text-gray-700 hover:bg-gray-200"
					}`}
					title={isCollapsed ? "Moods" : ""}
				>
					<svg
						className="w-5 h-5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{!isCollapsed && <span>Moods</span>}
				</NavLink>
				<NavLink
					to={`${basePath}/habits`}
					className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
						isPathActive("habits")
							? "bg-blue-500 text-white"
							: "bg-white text-gray-700 hover:bg-gray-200"
					}`}
					title={isCollapsed ? "Habits" : ""}
				>
					<svg
						className="w-5 h-5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
						/>
					</svg>
					{!isCollapsed && <span>Habits</span>}
				</NavLink>
			</nav>
		</aside>
	);
}
