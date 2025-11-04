import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function HabitsData() {
	const [habits, setHabits] = useState([]);
	const [loading, setLoading] = useState(true);
	const [completionLevels, setCompletionLevels] = useState({});
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
	const [editingHabit, setEditingHabit] = useState(null);
	const [editName, setEditName] = useState("");
	const [updatingProgress, setUpdatingProgress] = useState(null)

	const daysOfWeek = [
		{ short: "Mon", full: "Monday" },
		{ short: "Tue", full: "Tuesday" },
		{ short: "Wed", full: "Wednesday" },
		{ short: "Thu", full: "Thursday" },
		{ short: "Fri", full: "Friday" },
		{ short: "Sat", full: "Saturday" },
		{ short: "Sun", full: "Sunday" },
	];

	// Get week dates based on offset
	const getWeekDates = (offset) => {
		const today = new Date();
		const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
		const monday = new Date(today);
		monday.setDate(
			today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + offset * 7
		);

		const weekDates = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(monday);
			date.setDate(monday.getDate() + i);
			weekDates.push(date);
		}
		return weekDates;
	};

	const weekDates = getWeekDates(currentWeekOffset);
	const isCurrentWeek = currentWeekOffset === 0;

	// Format date range for display
	const getWeekRange = () => {
		const start = weekDates[0];
		const end = weekDates[6];
		const options = { month: "short", day: "numeric" };
		return `${start.toLocaleDateString(
			"en-US",
			options
		)} - ${end.toLocaleDateString("en-US", options)}, ${end.getFullYear()}`;
	};

	useEffect(() => {
		fetchHabits();
	}, [currentWeekOffset]);

	const fetchHabits = async () => {
		try {
			// Fetch habits with progress for each day of the week
			const habitsWithProgress = await Promise.all(
				weekDates.map(async (date) => {
					const dateStr = date.toISOString().split('T')[0];
					const res = await fetch(`${import.meta.env.VITE_API_URL}/api/progress?date=${dateStr}`, {
						method: "GET",
						credentials: "include",
					}
					);
					const data = await res.json();
					return {
						date: dateStr,
						habits: res.ok ? data.habits : [],
					};
				})
			);

			// Merge habits data by habit ID
			const habitsMap = new Map();
			habitsWithProgress.forEach(({ date, habits: dayHabits }) => {
				dayHabits.forEach((habit) => {
					if (!habitsMap.has(habit.id)) {
						habitsMap.set(habit.id, {
							...habit,
							progressByDate: {},
						});
					}
					habitsMap.get(habit.id).progressByDate[date] = habit.progress;
				});
			});
			console.log(Array.from(habitsMap.values()))
			setHabits(Array.from(habitsMap.values()));
		} catch (error) {
			console.error("Fetch habits error:", error);
		} finally {
			setLoading(false);
		}
	};

	const updateProgress = async (habitId, dayIndex) => {
		const key = `${habitId}-${dayIndex}`
		setUpdatingProgress(key)

		const date = weekDates[dayIndex];
		const dateStr = date.toISOString().split('T')[0];
		const habit = habits.find(h => h.id === habitId);
		const currentProgress = habit?.progressByDate?.[dateStr] || 0;

		// Cycle through 0 -> 1/3 -> 2/3 -> 1 -> 0
		const progressLevels = [0, 1 / 3, 2 / 3, 1];
		const currentIndex = progressLevels.findIndex(p => Math.abs(p - currentProgress) < 0.001);
		const nextProgress = progressLevels[(currentIndex + 1) % 4];

		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/progress`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					habitId,
					progress: nextProgress,
					date: dateStr,
				}),
			}
			);

			if (res.ok) {
				// Update local state
				setHabits(habits.map(h => {
					if (h.id === habitId) {
						return {
							...h,
							progressByDate: {
								...h.progressByDate,
								[dateStr]: nextProgress,
							},
						};
					}
					return h;
				}));
				toast.success("Progress updated")
			} else {
				toast.error("Failed to update progress");
			}
		} catch (error) {
			console.error("Update progress error:", error);
			toast.error("Something went wrong");
		} finally {
			setUpdatingProgress(null)
		}
	};

	const cycleCompletion = (habitId, dayIndex) => {
		const key = `${habitId}-${dayIndex}-${currentWeekOffset}`;
		setCompletionLevels((prev) => {
			const currentLevel = prev[key] || 0;
			const nextLevel = (currentLevel + 1) % 4; // Cycle 0 -> 1 -> 2 -> 3 -> 0
			return {
				...prev,
				[key]: nextLevel,
			};
		});
	};

	const getCompletionLevel = (habitId, dayIndex) => {
		const date = weekDates[dayIndex];
		const dateStr = date.toISOString().split('T')[0];
		const habit = habits.find(h => h.id === habitId);
		const progress = habit?.progressByDate?.[dateStr] || 0;

		// Convert progress to level (0, 1, 2, 3)
		if (progress === 0) return 0;
		if (Math.abs(progress - 1 / 3) < 0.001) return 1;
		if (Math.abs(progress - 2 / 3) < 0.001) return 2;
		if (Math.abs(progress - 1) < 0.001) return 3;
		return 0;
	};

	const getCompletionColor = (level) => {
		switch (level) {
			case 0:
				return "bg-gray-200 border-gray-300";
			case 1:
				return "bg-red-300 border-red-400";
			case 2:
				return "bg-yellow-300 border-yellow-400";
			case 3:
				return "bg-green-400 border-green-500";
			default:
				return "bg-gray-200 border-gray-300";
		}
	};

	const deleteHabit = async (habitId) => {
		if (!confirm("Are you sure you want to delete this habit?")) return;

		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/habits/${habitId}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			);

			if (res.ok) {
				toast.success("Habit deleted successfully!");
				setHabits(habits.filter((h) => h.id !== habitId));
			} else {
				toast.error("Failed to delete habit");
			}
		} catch (error) {
			console.error("Delete habit error:", error);
			toast.error("Something went wrong");
		}
	};

	const startEdit = (habit) => {
		setEditingHabit(habit.id);
		setEditName(habit.name);
	};

	const cancelEdit = () => {
		setEditingHabit(null);
		setEditName("");
	};

	const saveEdit = async (habitId) => {
		if (!editName.trim()) {
			toast.error("Habit name cannot be empty");
			return;
		}

		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/habits/${habitId}`,
				{
					method: "PUT",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: editName }),
				}
			);

			if (res.ok) {
				toast.success("Habit updated successfully!");
				setHabits(
					habits.map((h) => (h.id === habitId ? { ...h, name: editName } : h))
				);
				cancelEdit();
			} else {
				toast.error("Failed to update habit");
			}
		} catch (error) {
			console.error("Update habit error:", error);
			toast.error("Something went wrong");
		}
	};

	if (loading) {
		return <div className="text-gray-500">Loading habits...</div>;
	}

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header Section */}
			<div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 shadow-sm">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h3 className="text-2xl font-bold text-gray-800 mb-1">
							Your Habits
						</h3>
						<p className="text-sm text-gray-600">Track your daily progress</p>
					</div>

					{/* Week Navigation */}
					<div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
						<button
							onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							title="Previous week"
						>
							<svg
								className="w-5 h-5 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<div className="text-center min-w-[220px]">
							<div className="text-sm font-semibold text-gray-700">
								{getWeekRange()}
							</div>
							{isCurrentWeek && (
								<span className="text-xs text-blue-600 font-medium">
									Current Week
								</span>
							)}
						</div>
						<button
							onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							title="Next week"
						>
							<svg
								className="w-5 h-5 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
						{!isCurrentWeek && (
							<button
								onClick={() => setCurrentWeekOffset(0)}
								className="ml-2 px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
							>
								Today
							</button>
						)}
					</div>
				</div>
			</div>

			{habits.length === 0 ? (
				<div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
					<svg
						className="w-16 h-16 mx-auto text-gray-400 mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					<p className="text-gray-500 text-lg mb-2">No habits yet</p>
					<p className="text-gray-400 text-sm">
						Start building good habits by adding them in the Logs section!
					</p>
				</div>
			) : (
				<div className="bg-white rounded-xl shadow-md overflow-hidden">
					{/* Legend */}
					<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
						<div className="flex flex-wrap items-center gap-6 text-sm">
							<span className="font-semibold text-gray-700">
								Completion Levels:
							</span>
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
								<span className="text-gray-600">None</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center">
									<span className="text-red-600 text-lg">✕</span>
								</div>
								<span className="text-gray-600">Low</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-center justify-center">
									<span className="text-yellow-600 text-lg">−</span>
								</div>
								<span className="text-gray-600">Medium</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center">
									<span className="text-green-600 text-lg">✓</span>
								</div>
								<span className="text-gray-600">High</span>
							</div>
						</div>
					</div>

					{/* Table Content */}
					<div className="overflow-x-auto">
						<div className="p-6">
							{/* Header row with days */}
							<div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
								<div className="w-52 text-sm font-semibold text-gray-700 pl-2">
									Habit Name
								</div>
								{daysOfWeek.map((day, index) => {
									const date = weekDates[index];
									const isToday =
										date.toDateString() === new Date().toDateString();
									return (
										<div key={index} className="flex flex-col items-center">
											<div
												className={`w-16 h-16 flex flex-col items-center justify-center font-bold rounded-xl border-2 transition-all ${isToday
													? "bg-blue-500 text-white border-blue-600 shadow-lg scale-105"
													: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
													}`}
												title={`${day.full} - ${date.toLocaleDateString()}`}
											>
												<span className="text-[10px] font-medium opacity-80">
													{day.short}
												</span>
												<span className="text-xl font-bold">
													{date.getDate()}
												</span>
											</div>
										</div>
									);
								})}
								<div className="w-16 text-[10px] font-semibold text-gray-600 text-center uppercase tracking-wide">
									Actions
								</div>
							</div>

							{/* Habit rows */}
							<div className="space-y-2">
								{habits.map((habit, habitIndex) => (
									<div
										key={habit.id}
										className={`flex items-center gap-3 p-4 rounded-xl transition-all ${habitIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
											} hover:bg-blue-50 hover:shadow-sm border border-transparent hover:border-blue-200`}
									>
										{editingHabit === habit.id ? (
											<div className="w-52 flex items-center gap-2">
												<input
													type="text"
													value={editName}
													onChange={(e) => setEditName(e.target.value)}
													className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
													autoFocus
												/>
												<button
													onClick={() => saveEdit(habit.id)}
													className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium"
												>
													✓
												</button>
												<button
													onClick={cancelEdit}
													className="px-3 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 font-medium"
												>
													✕
												</button>
											</div>
										) : (
											<div
												className="w-52 text-gray-800 font-medium truncate pl-2"
												title={habit.name}
											>
												{habit.name}
											</div>
										)}
										{daysOfWeek.map((day, dayIndex) => {
											const level = getCompletionLevel(habit.id, dayIndex);
											return (
												<button
													key={dayIndex}
													onClick={() => updateProgress(habit.id, dayIndex)}
													disabled={updatingProgress === `${habit.id}-${dayIndex}`}
													className={`w-16 h-16 flex items-center justify-center rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95 ${getCompletionColor(
														level
													)} shadow-sm hover:shadow-md`}
													title={`${day.full} - Level ${level}/3 (Click to cycle)`}
												>
													{updatingProgress === `${habit.id}-${dayIndex}` ? (
														<div className="animate-spin h-6 w-6 border-2 border-gray-600 border-t-transparent rounded-full"></div>
													) : (
														<>
															{level === 3 && (
																<svg
																	className="w-9 h-9 text-green-700"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={3}
																		d="M5 13l4 4L19 7"
																	/>
																</svg>
															)}
															{level === 2 && (
																<span className="text-3xl text-yellow-700 font-bold">
																	−
																</span>
															)}
															{level === 1 && (
																<span className="text-3xl text-red-600 font-bold">
																	✕
																</span>
															)}
														</>
													)}
												</button>
											);
										})}
										<div className="flex items-center gap-1">
											<button
												onClick={() => startEdit(habit)}
												disabled={editingHabit !== null}
												className="w-10 h-10 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
												title="Edit habit"
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
													/>
												</svg>
											</button>
											<button
												onClick={() => deleteHabit(habit.id)}
												className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all"
												title="Delete habit"
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
