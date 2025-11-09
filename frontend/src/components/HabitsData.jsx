import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FileText } from "lucide-react";
import WeekBar from "./WeekBar";

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
				return "bg-indigo-900 border-gray-300";
			case 1:
				return "bg-violet-800 border-gray-400";
			case 2:
				return "bg-gray-400 border-gray-500";
			case 3:
				return "bg-gray-700 border-violet-400";
			default:
				return "bg-indigo-900 border-gray-300";
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

	// Add habit form moved to separate component

	if (loading) {
		return <div className="text-gray-500">Loading habits...</div>;
	}

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header Section */}
			<div className="bg-indigo-900 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 border border-violet-400">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
					<div>
						<h3 className="text-xl sm:text-2xl font-bold text-purple-100 mb-1">
							Your Habits
						</h3>
						<p className="text-xs sm:text-sm text-violet-300">Track your daily progress</p>
					</div>

					{/* Week Navigation */}
					<div className="w-full sm:w-auto">
						<WeekBar currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} />
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:gap-6">
				<div className="order-1">
					{habits.length === 0 ? (
				<div className="bg-indigo-900 border-2 border-dashed border-violet-400 rounded-lg p-6 sm:p-8 lg:p-12 text-center">
					<svg
						className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto text-violet-300 mb-3 sm:mb-4"
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
					<p className="text-violet-300 text-base sm:text-lg mb-2">No habits yet</p>
					<p className="text-gray-600 text-xs sm:text-sm">
						Start building good habits by adding them below!
					</p>
				</div>
					) : (
				<div className="bg-indigo-900 rounded-lg border border-violet-400 overflow-hidden">
					{/* Legend */}
					<div className="bg-indigo-900 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-violet-400">
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
							<span className="font-semibold text-purple-100">
								Completion Levels:
							</span>
							<div className="flex items-center gap-1.5 sm:gap-2">
								<div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-indigo-900 border-2 border-gray-300 rounded shrink-0"></div>
								<span className="text-violet-300 whitespace-nowrap">None</span>
							</div>
							<div className="flex items-center gap-1.5 sm:gap-2">
								<div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-violet-800 border-2 border-gray-400 rounded flex items-center justify-center shrink-0">
									<span className="text-gray-600 text-sm sm:text-base lg:text-lg">✕</span>
								</div>
								<span className="text-violet-300 whitespace-nowrap">Low</span>
							</div>
							<div className="flex items-center gap-1.5 sm:gap-2">
								<div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-gray-400 border-2 border-gray-500 rounded flex items-center justify-center shrink-0">
									<span className="text-violet-300 text-sm sm:text-base lg:text-lg">−</span>
								</div>
								<span className="text-violet-300 whitespace-nowrap">Medium</span>
							</div>
							<div className="flex items-center gap-1.5 sm:gap-2">
								<div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-gray-700 border-2 border-violet-400 rounded flex items-center justify-center shrink-0">
									<span className="text-white text-sm sm:text-base lg:text-lg">✓</span>
								</div>
								<span className="text-violet-300 whitespace-nowrap">High</span>
							</div>
						</div>
					</div>

					{/* Table Content */}
						<div className="overflow-x-auto -mx-2 sm:mx-0">
							<table className="min-w-full table-auto">
							<thead>
								<tr className="border-b-2 border-violet-400">
									<th className="text-left text-xs sm:text-sm font-semibold text-purple-100 pl-2 sm:pl-4 py-2 sm:py-3 sticky left-0 bg-indigo-900 z-10">Habit Name</th>
									{daysOfWeek.map((day, index) => {
										const date = weekDates[index];
										const isToday = date.toDateString() === new Date().toDateString();
										return (
											<th key={day.short} className="py-2 px-1">
												<div className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex flex-col items-center justify-center font-bold rounded border-2 ${isToday ? "bg-indigo-950 text-white border-violet-400 shadow-lg" : "bg-indigo-900 text-purple-100 border-gray-400"}`} title={`${day.full} - ${date.toLocaleDateString()}`}>
													<span className="text-[8px] sm:text-[9px] lg:text-[10px] font-medium opacity-80">{day.short}</span>
													<span className="text-base sm:text-lg lg:text-xl font-bold">{date.getDate()}</span>
												</div>
											</th>
										);
									})}
									<th className="w-20 sm:w-24 lg:w-28 text-center text-[8px] sm:text-[9px] lg:text-[10px] font-semibold text-purple-100 uppercase tracking-wide sticky right-0 bg-indigo-900 z-10">Actions</th>
								</tr>
							</thead>
							<tbody>
								{habits.map((habit, habitIndex) => (
									<tr key={habit.id} className={`${habitIndex % 2 === 0 ? "bg-indigo-900" : "bg-indigo-800"} hover:bg-indigo-700 border-b border-violet-400`}>
										<td className="pl-2 sm:pl-4 py-3 sm:py-4 align-middle overflow-visible sticky left-0 bg-inherit z-10">
											{editingHabit === habit.id ? (
												<input
													type="text"
													value={editName}
													onChange={(e) => setEditName(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															e.preventDefault();
															saveEdit(habit.id);
														}
													}}
													onBlur={cancelEdit}
													className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-violet-400 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-indigo-900"
													style={{ width: `${Math.min(Math.max((editName?.length || 0) + 2, 12), 40)}ch` }}
													autoFocus
												/>
											) : (
												<div className="max-w-[120px] sm:max-w-[200px] lg:max-w-md text-purple-100 text-xs sm:text-sm font-medium truncate" title={habit.name}>{habit.name}</div>
											)}
										</td>
										{daysOfWeek.map((day, dayIndex) => {
											const level = getCompletionLevel(habit.id, dayIndex);
											return (
												<td key={dayIndex} className="py-2 px-1 align-middle">
													<button onClick={() => updateProgress(habit.id, dayIndex)} disabled={updatingProgress === `${habit.id}-${dayIndex}`} className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded border-2 transition-all duration-200 hover:scale-110 active:scale-95 ${getCompletionColor(level)} hover:shadow-md`} title={`${day.full} - Level ${level}/3 (Click to cycle)`}>
														{updatingProgress === `${habit.id}-${dayIndex}` ? (
															<div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-2 border-gray-600 border-t-transparent rounded-full"></div>
														) : (
															<>
																{level === 3 && (
																	<svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
																	</svg>
																)}
																{level === 2 && (<span className="text-xl sm:text-2xl lg:text-3xl text-violet-300 font-bold">−</span>)}
																{level === 1 && (<span className="text-xl sm:text-2xl lg:text-3xl text-gray-600 font-bold">✕</span>)}
															</>
														)}
													</button>
												</td>
											);
										})}
										<td className="w-20 sm:w-24 lg:w-28 py-2 align-middle sticky right-0 bg-inherit z-10">
											<div className="flex items-center justify-center gap-0.5 sm:gap-1">
												<button onClick={() => startEdit(habit)} disabled={editingHabit !== null} className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center text-purple-100 hover:bg-indigo-700 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-gray-300 hover:border-violet-400" title="Edit habit">
													<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
													</svg>
												</button>
												<button onClick={() => deleteHabit(habit.id)} className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center text-purple-100 hover:bg-indigo-700 rounded transition-all border border-gray-300 hover:border-violet-400" title="Delete habit">
													<svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					</div>
				)}
				</div>
			</div>

			{/* All Habits Log Section */}
			<div className="bg-indigo-900 rounded-lg border border-violet-400 p-4 sm:p-6 mt-4 sm:mt-6">
				<div className="flex items-center gap-2 mb-3 sm:mb-4">
					<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-100" />
					<h2 className="text-xl sm:text-2xl font-bold text-purple-100">All Habits</h2>
				</div>

				<div className="max-h-96 overflow-y-auto space-y-2">
					{habits.length === 0 ? (
						<p className="text-violet-300 text-xs sm:text-sm text-center py-6 sm:py-8">No habits yet. Go to Logs page to add one!</p>
					) : (
						habits.map((habit) => {
							const date = new Date(habit.createdAt);
							const timestamp = date.toLocaleString('en-US', {
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
								hour12: false
							});

							return (
								<div key={habit.id} className="p-3 border border-violet-400 rounded bg-indigo-800 hover:bg-indigo-700 transition-colors">
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											{editingHabit === habit.id ? (
												<div className="mb-2">
													<input
														type="text"
														value={editName}
														onChange={(e) => setEditName(e.target.value)}
														onKeyDown={(e) => {
															if (e.key === 'Enter') {
																e.preventDefault();
																saveEdit(habit.id);
															}
														}}
														className="w-full px-3 py-2 border-2 border-violet-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
														autoFocus
													/>
												</div>
											) : (
												<p className="text-sm font-medium text-purple-100 mb-1">{habit.name}</p>
											)}
											<p className="text-xs text-violet-300">{timestamp}</p>
										</div>
										<div className="flex items-center gap-1">
											{editingHabit === habit.id ? (
												<>
													<button
														onClick={() => saveEdit(habit.id)}
														className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400"
														title="Save"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
														</svg>
													</button>
													<button
														onClick={cancelEdit}
														className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400"
														title="Cancel"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</>
											) : (
												<>
													<button
														onClick={() => startEdit(habit)}
														disabled={editingHabit !== null}
														className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400 disabled:opacity-30 disabled:cursor-not-allowed"
														title="Edit habit"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
														</svg>
													</button>
													<button
														onClick={() => deleteHabit(habit.id)}
														className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400"
														title="Delete habit"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>
												</>
											)}
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
