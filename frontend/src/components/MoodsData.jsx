import { useEffect, useState } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import WeekBar from './WeekBar';
import toast from 'react-hot-toast';

export default function MoodsData() {
	const [moods, setMoods] = useState([]);
	const [showInput, setShowInput] = useState(false);
	const [todayLogged, setTodayLogged] = useState(false);
	const [loading, setLoading] = useState(true);
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

	const getTodayDate = () => {
		const today = new Date();
		return today.toISOString().split('T')[0];
	};

	// Check if mood already logged today
	const checkTodayLogged = () => {
		const today = getTodayDate();
		return moods.some(mood => {
			const moodDate = new Date(mood.createdAt).toISOString().split('T')[0];
			return moodDate === today;
		});
	};

	const getMoodLabel = (moodX, moodY) => {
		// Convert from -1 to 1 range to 0 to 1 range for easier comparison
		const happy = (moodX + 1) / 2;
		const calm = (moodY + 1) / 2;

		const happinessPercent = Math.round(happy * 100);
		const calmnessPercent = Math.round(calm * 100);

		return `Happiness: ${happinessPercent}% | Calmness: ${calmnessPercent}%`;
	};

	const handleMoodClick = async (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;

		// Convert from 0-1 range to -1 to 1 range (centered at 0.5)
		// x: 0 = left (sad/-1), 0.5 = center (0), 1 = right (happy/+1)
		// y: 0 = top (calm/+1), 0.5 = center (0), 1 = bottom (angry/-1)
		const moodX = (x * 2) - 1;
		const moodY = 1 - (y * 2); // Invert Y so top is positive (calm)

		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ moodX, moodY }),
			});

			const data = await res.json();

			if (res.ok) {
				// Add the new mood to the state
				setMoods([data.mood, ...moods]);
				setTodayLogged(true);
				setShowInput(false);
				// Switch to current week to show the newly added mood
				setCurrentWeekOffset(0);
			} else {
				alert(data.message || 'Failed to log mood');
			}
		} catch (error) {
			console.error("Add mood error:", error);
			alert('Failed to log mood. Please try again.');
		}
	};

	const handleDeleteMood = async (moodId) => {
		if (!confirm('Are you sure you want to delete this mood entry?')) return;

		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods/${moodId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (res.ok) {
				// Update local state by filtering out the deleted mood
				setMoods(prevMoods => prevMoods.filter(m => m.id !== moodId));
				toast.success('Mood deleted successfully');
			} else {
				const data = await res.json();
				toast.error(data.message || 'Failed to delete mood');
			}
		} catch (error) {
			console.error('Delete error:', error);
			toast.error('Something went wrong');
		}
	};

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

	const fetchMoods = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods`, {
				method: "GET",
				credentials: "include",
			});
			const data = await res.json();
			if (res.ok) {
				setMoods(data.moods);
			}
		} catch (error) {
			console.error("Fetch moods error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMoods();
	}, [currentWeekOffset]);

	// Filter moods by selected week
	const weekDates = getWeekDates(currentWeekOffset);
	const filteredMoods = moods.filter(mood => {
		const moodDate = new Date(mood.createdAt);
		const startOfWeek = weekDates[0];
		startOfWeek.setHours(0, 0, 0, 0);
		const endOfWeek = new Date(weekDates[6]);
		endOfWeek.setHours(23, 59, 59, 999);
		return moodDate >= startOfWeek && moodDate <= endOfWeek;
	});

	const getLineChartData = () => {
		return [
			{
				id: 'Happiness',
				color: '#000000',
				data: filteredMoods.map((mood, idx) => {
					const date = new Date(mood.createdAt);
					const timeStr = date.toLocaleString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
						hour12: false
					});
					// Convert from -1 to 1 range to 0 to 100 percentage
					return {
						x: timeStr,
						y: ((mood.moodX + 1) / 2 * 100).toFixed(0)
					};
				}).reverse()
			},
			{
				id: 'Calmness',
				color: '#4b5563',
				data: filteredMoods.map((mood, idx) => {
					const date = new Date(mood.createdAt);
					const timeStr = date.toLocaleString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
						hour12: false
					});
					// Convert from -1 to 1 range to 0 to 100 percentage
					return {
						x: timeStr,
						y: ((mood.moodY + 1) / 2 * 100).toFixed(0)
					};
				}).reverse()
			}
		];
	};

	if (loading) {
		return <div className="text-gray-500">Loading moods...</div>;
	}

	return (
		<div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">

				{/* Header Section */}
				<div className="bg-white p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 border border-black">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
						<div>
							<h3 className="text-xl sm:text-2xl font-bold text-black mb-1">
								Your Moods
							</h3>
							<p className="text-xs sm:text-sm text-gray-700">
								Click anywhere on the grid to log your current mood
							</p>
						</div>
						<div className="w-full sm:w-auto">
							<WeekBar currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} />
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:gap-6">
					{/* Line Chart */}
					<div className="bg-white rounded-lg border border-black p-4 sm:p-6">
						<div className="flex items-center gap-2 mb-3 sm:mb-4">
							<TrendingUp className="text-black w-5 h-5 sm:w-6 sm:h-6" />
							<h2 className="text-xl sm:text-2xl font-bold text-black">Mood Trends</h2>
						</div>

						{filteredMoods.length === 0 ? (
							<p className="text-gray-700 text-xs sm:text-sm text-center py-6 sm:py-8">No mood entries for this week. Go to Logs page to log your mood!</p>
						) : (
							<>
								<div className="h-48 sm:h-56 lg:h-64">
									<ResponsiveLine
										data={getLineChartData()}
										margin={{ top: 30, right: 30, bottom: 60, left: 10 }}
										xScale={{ type: 'point' }}
										yScale={{
											type: 'linear',
											min: 0,
											max: 100,
											stacked: false,
											reverse: false
										}}
										axisTop={null}
										axisRight={null}
										axisBottom={{
											tickSize: 5,
											tickPadding: 5,
											tickRotation: -45,
											legend: 'Time',
											legendOffset: 45,
											legendPosition: 'middle'
										}}
										axisLeft={null}
										pointSize={8}
										pointColor={{ from: 'serieColor' }}
										pointBorderWidth={2}
										pointBorderColor={{ from: 'color' }}
										pointLabelYOffset={-12}
										useMesh={true}
										colors={['#3b82f6', '#ef4444']}
										lineWidth={3}
										enableGridX={false}
										enableGridY={false}
										legends={[]}
										curve="monotoneX"
									/>
								</div>
								<div className="flex gap-3 sm:gap-4 justify-center mt-3 sm:mt-4 text-xs sm:text-sm">
									<div className="flex items-center gap-1.5 sm:gap-2">
										<div className="w-3 h-0.5 sm:w-4 sm:h-1 bg-blue-500 rounded"></div>
										<span className="text-gray-700">Happiness</span>
									</div>
									<div className="flex items-center gap-1.5 sm:gap-2">
										<div className="w-3 h-0.5 sm:w-4 sm:h-1 bg-red-500 rounded"></div>
										<span className="text-gray-700">Calmness</span>
									</div>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
					<div className="bg-white rounded-lg border border-black p-3 sm:p-4 text-center">
						<div className="text-xl sm:text-2xl font-bold text-black">{filteredMoods.length}</div>
						<div className="text-xs sm:text-sm text-gray-700">Week Entries</div>
					</div>
					<div className="bg-white rounded-lg border border-black p-3 sm:p-4 text-center">
						<div className="text-xl sm:text-2xl font-bold text-black">
							{filteredMoods.length > 0 ? (filteredMoods.reduce((sum, m) => sum + ((m.moodX + 1) / 2), 0) / filteredMoods.length * 100).toFixed(0) : 0}%
						</div>
						<div className="text-xs sm:text-sm text-gray-700">Avg Happiness</div>
					</div>
					<div className="bg-white rounded-lg border border-black p-3 sm:p-4 text-center">
						<div className="text-xl sm:text-2xl font-bold text-black">
							{filteredMoods.length > 0 ? (filteredMoods.reduce((sum, m) => sum + ((m.moodY + 1) / 2), 0) / filteredMoods.length * 100).toFixed(0) : 0}%
						</div>
						<div className="text-xs sm:text-sm text-gray-700">Avg Calmness</div>
					</div>
				</div>

				{/* All Mood Entries */}
				<div className="bg-white rounded-lg border border-black p-4 sm:p-6 mt-4 sm:mt-6">
					<div className="flex items-center gap-2 mb-3 sm:mb-4">
						<Heart className="text-black w-5 h-5 sm:w-6 sm:h-6" />
						<h2 className="text-xl sm:text-2xl font-bold text-black">All Mood Entries</h2>
					</div>

					<div className="max-h-96 overflow-y-auto space-y-2">
						{moods.length === 0 ? (
							<p className="text-gray-700 text-xs sm:text-sm text-center py-6 sm:py-8">No mood entries yet. Go to Logs page to log your mood!</p>
						) : (
							moods.map((mood, idx) => {
								const date = new Date(mood.createdAt);
								const timestamp = date.toLocaleString('en-US', {
									month: '2-digit',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit',
									hour12: false
								});

								return (
									<div key={mood.id} className="p-3 border border-black rounded bg-gray-50 hover:bg-gray-100 transition-colors">
										<div className="flex items-start justify-between gap-3">
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-black mb-1">{getMoodLabel(mood.moodX, mood.moodY)}</p>
												<p className="text-xs text-gray-700">{timestamp}</p>
											</div>
											<div className="flex items-center">
												<button
													onClick={() => handleDeleteMood(mood.id)}
													className="p-2 text-black hover:bg-gray-200 rounded transition-colors border border-gray-300 hover:border-black"
													title="Delete mood"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>
		</div>
	);
}