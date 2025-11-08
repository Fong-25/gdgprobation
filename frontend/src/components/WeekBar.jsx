export default function WeekBar({ currentWeekOffset, setCurrentWeekOffset }) {
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

	return (
		<div className="flex items-center gap-2 sm:gap-3 bg-white px-2 sm:px-4 py-2 rounded border border-black w-full sm:w-auto">
			<button
				onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
				className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
				title="Previous week"
			>
				<svg
					className="w-4 h-4 sm:w-5 sm:h-5 text-black"
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
			<div className="text-center flex-1 sm:flex-none min-w-0 sm:min-w-[200px] lg:min-w-[220px]">
				<div className="text-xs sm:text-sm font-semibold text-black truncate">
					{getWeekRange()}
				</div>
				{isCurrentWeek ? (
					<span className="text-[10px] sm:text-xs text-gray-700 font-medium">
						Current Week
					</span>
				) : (
					<button
						onClick={() => setCurrentWeekOffset(0)}
						className="text-[10px] sm:text-xs text-gray-700 font-medium hover:text-black underline"
					>
						Jump to current week
					</button>
				)}
			</div>
			<button
				onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
				className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
				title="Next week"
			>
				<svg
					className="w-4 h-4 sm:w-5 sm:h-5 text-black"
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
		</div>
	);
}

