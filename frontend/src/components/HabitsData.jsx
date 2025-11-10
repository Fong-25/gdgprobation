import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { Save, X, Pencil, Trash2, Check } from "lucide-react";
import CardWeek from "./CardWeek";
import { getWeekDates } from "./WeekBar";
import IconButton from "./IconButton";

export default function HabitsData() {
	const [habits, setHabits] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

	const daysOfWeek = [
		{ short: "Mon", full: "Monday" },
		{ short: "Tue", full: "Tuesday" },
		{ short: "Wed", full: "Wednesday" },
		{ short: "Thu", full: "Thursday" },
		{ short: "Fri", full: "Friday" },
		{ short: "Sat", full: "Saturday" },
		{ short: "Sun", full: "Sunday" },
	];

	const weekDates = getWeekDates(currentWeekOffset);

	useEffect(() => {
		fetchHabits();
	}, [currentWeekOffset]);

	const fetchHabits = async () => {
		try {
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

	if (loading) {
		return <div className="text-gray-500">Loading habits...</div>;
	}

	return (
		<div className="max-w-7xl mx-auto">
			<CardWeek
				title="Your Habits"
				description="Track your daily progress"
				icon={Check}
				currentWeekOffset={currentWeekOffset}
				setCurrentWeekOffset={setCurrentWeekOffset}
			/>

			<div className="grid grid-cols-1 gap-4 sm:gap-6">
				{habits.length === 0 ? (
					<HabitTableEmpty />
				) : (
					<HabitTable
						habits={habits}
						setHabits={setHabits}
						daysOfWeek={daysOfWeek}
						weekDates={weekDates}
					/>
				)}
			</div>
		</div>
	);
}

function HabitsTableHeader({ daysOfWeek, weekDates }) {
	const daysWithDates = useMemo(
		() =>
			daysOfWeek.map((day, index) => {
				const date = weekDates[index];
				return {
					...day,
					date,
					isToday: date.toDateString() === new Date().toDateString(),
				};
			}),
		[daysOfWeek, weekDates]
	);

	return (
		<thead>
			<tr className="border-b-2 border-violet-400">
				<th></th>

				{daysWithDates.map(({ short, full, date, isToday }) => (
					<th key={short} className="py-2 px-1">
						<div
							className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex flex-col items-center justify-center font-bold rounded border-2 ${isToday ? "bg-indigo-950 text-white border-violet-400 shadow-lg" : "bg-indigo-900 text-purple-100 border-gray-400"
								}`}
							title={`${full} - ${date.toLocaleDateString()}`}
						>
							<span className="text-[8px] sm:text-[9px] lg:text-[10px] font-medium opacity-80">
								{short}
							</span>
							<span className="text-base sm:text-lg lg:text-xl font-bold">
								{date.getDate()}
							</span>
						</div>
					</th>
				))}
			</tr>
		</thead>
	);
}

function HabitTableEmpty() {
	return <div className="bg-indigo-900 text-violet-300 border-2 border-dashed border-violet-400 rounded-lg p-6 sm:p-8 lg:p-12 text-center">
		<Save className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4" />
		<p className="text-base sm:text-lg mb-2">No habits yet</p>
		<p className="text-violet-600 text-xs sm:text-sm">
			Start building good habits by adding them below!
		</p>
	</div>
}

function HabitTable({ habits, setHabits, daysOfWeek, weekDates }) {
	return (
		<div className="bg-indigo-900 rounded-lg border border-violet-400 overflow-hidden overflow-x-auto -mx-2 sm:mx-0">
			<table className="min-w-full table-auto">
				<HabitsTableHeader
					daysOfWeek={daysOfWeek}
					weekDates={weekDates}
				/>
				<tbody>
					{habits.map((habit, habitIndex) => (
						<HabitRow
							key={habit.id}
							habit={habit}
							habitIndex={habitIndex}
							daysOfWeek={daysOfWeek}
							weekDates={weekDates}
							setHabits={setHabits}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

function HabitRow({ habit, habitIndex, daysOfWeek, weekDates, setHabits }) {
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState("");

	const deleteHabit = async () => {
		if (!confirm("Are you sure you want to delete this habit?")) return;

		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/habits/${habit.id}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			);

			if (res.ok) {
				toast.success("Habit deleted successfully!");
				setHabits(currentHabits => currentHabits.filter((h) => h.id !== habit.id));
			} else {
				toast.error("Failed to delete habit");
			}
		} catch (error) {
			console.error("Delete habit error:", error);
			toast.error("Something went wrong");
		}
	};

	const startEdit = () => {
		setIsEditing(true);
		setEditName(habit.name);
	};

	const cancelEdit = () => {
		setIsEditing(false);
		setEditName("");
	};

	const saveEdit = async () => {
		if (!editName.trim()) {
			toast.error("Habit name cannot be empty");
			return;
		}

		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/habits/${habit.id}`,
				{
					method: "PUT",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: editName }),
				}
			);

			if (res.ok) {
				toast.success("Habit updated successfully!");
				setHabits(currentHabits =>
					currentHabits.map((h) => (h.id === habit.id ? { ...h, name: editName } : h))
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

	return (
		<tr className={`${habitIndex % 2 === 0 ? "bg-indigo-900" : "bg-indigo-800"} hover:bg-indigo-700 border-b border-violet-400`}>
			<td className="pl-2 sm:pl-4 py-3 sm:py-4 align-middle overflow-visible sticky left-0 bg-inherit z-10">
				{isEditing ? (
					<input
						type="text"
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								saveEdit();
							} else if (e.key === 'Escape') {
								cancelEdit();
							}
						}}
						className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-violet-400 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-indigo-900"
						style={{ width: `${Math.min(Math.max((editName?.length || 0) + 2, 12), 40)}ch` }}
						autoFocus
					/>
				) : (
					<div className="max-w-[120px] sm:max-w-[200px] lg:max-w-md text-purple-100 text-xs sm:text-sm font-medium truncate" title={habit.name}>{habit.name}</div>
				)}
			</td>
			{daysOfWeek.map((day, dayIndex) => (
				<ProgressButton
					key={dayIndex}
					habit={habit}
					dayIndex={dayIndex}
					weekDates={weekDates}
					setHabits={setHabits}
				/>
			))}
			<td className="w-20 sm:w-24 lg:w-28 py-2 align-middle sticky right-0 bg-inherit z-10">
				<div className="flex items-center justify-center gap-0.5 sm:gap-1">
					{isEditing ? (
						<>
							<IconButton
								onClick={saveEdit}
								icon={Save}
								title="Save habit name"
								hasBorder={true}
							/>
							<IconButton
								onClick={cancelEdit}
								icon={X}
								title="Cancel editing"
								hasBorder={true}
							/>
						</>
					) : (
						<>
							<IconButton
								onClick={startEdit}
								icon={Pencil}
								title="Edit habit"
								hasBorder={true}
							/>
							<IconButton
								onClick={deleteHabit}
								icon={Trash2}
								title="Delete habit"
								hasBorder={true}
							/>
						</>
					)}
				</div>
			</td>
		</tr>
	);
}

function ProgressButton({ habit, dayIndex, weekDates, setHabits }) {
	const [updatingDayIndex, setUpdatingDayIndex] = useState(null);

	const updateProgress = async (dayIndex) => {
		setUpdatingDayIndex(dayIndex)

		const date = weekDates[dayIndex];
		const dateStr = date.toISOString().split('T')[0];
		const currentProgress = habit?.progressByDate?.[dateStr] || 0;

		const progressLevels = [0, 1 / 3, 2 / 3, 1];
		const currentIndex = progressLevels.findIndex(p => Math.abs(p - currentProgress) < 0.001);
		const nextProgress = progressLevels[(currentIndex + 1) % 4];

		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/progress`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					habitId: habit.id,
					progress: nextProgress,
					date: dateStr,
				}),
			}
			);

			if (res.ok) {
				setHabits(currentHabits => currentHabits.map(h => {
					if (h.id === habit.id) {
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
			setUpdatingDayIndex(null)
		}
	};

	const getCompletionLevel = (dayIndex) => {
		const date = weekDates[dayIndex];
		const dateStr = date.toISOString().split('T')[0];
		const progress = habit?.progressByDate?.[dateStr] || 0;

		if (progress === 0) return 0;
		if (Math.abs(progress - 1 / 3) < 0.001) return 1;
		if (Math.abs(progress - 2 / 3) < 0.001) return 2;
		if (Math.abs(progress - 1) < 0.001) return 3;
		return 0;
	};

	const level = getCompletionLevel(dayIndex);

	return (
		<td className="py-2 px-1 align-middle">
			<button
				onClick={() => updateProgress(dayIndex)}
				disabled={updatingDayIndex === dayIndex}
				className="mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded border-3 border-gray-400 transition-all duration-300 hover:scale-105 active:scale-95"
			>
				{updatingDayIndex === dayIndex ? (
					<div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
				) : (
					<svg className="w-full h-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
						<path
							className={`transition-transform duration-300 ${level === 0 || level === 2 ? '-translate-x-8' : 'translate-x-0'} fill-indigo-500 stroke-indigo-500`}
							d="M20 32H0V0h1Z"
						/>
						<path
							className={`transition-transform duration-300 ${level === 0 || level === 1 ? 'translate-x-8' : 'translate-x-0'} fill-indigo-500 stroke-indigo-500`}
							d="M1 0h31v32H20Z"
						/>
					</svg>
				)}
			</button>
		</td>
	);
}