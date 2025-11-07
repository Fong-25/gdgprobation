import { useEffect, useState } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';

export default function MoodsData() {
	const [moods, setMoods] = useState([]);
	const [showInput, setShowInput] = useState(false);
	const [todayLogged, setTodayLogged] = useState(false);
	const [loading, setLoading] = useState(true);

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

		if (happy > 0.6 && calm > 0.6) return 'Content 😌';
		if (happy > 0.6 && calm < 0.4) return 'Excited 🤗';
		if (happy < 0.4 && calm > 0.6) return 'Peaceful 😴';
		if (happy < 0.4 && calm < 0.4) return 'Stressed 😤';
		if (happy > 0.5) return 'Happy 😊';
		if (calm > 0.5) return 'Calm 😇';
		if (happy < 0.5 && calm < 0.5) return 'Upset 😞';
		return 'Neutral 😶';
	};

	const handleMoodClick = async (e) => {
		// Check if already logged today
		if (checkTodayLogged()) {
			alert('You have already logged your mood today! Come back tomorrow 😊');
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = 1 - (e.clientY - rect.top) / rect.height;

		// Convert from 0-1 range to -1 to 1 range
		const moodX = (x * 2) - 1;
		const moodY = (y * 2) - 1;

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
			} else {
				alert(data.message || 'Failed to log mood');
			}
		} catch (error) {
			console.error("Add mood error:", error);
			alert('Failed to log mood. Please try again.');
		}
	};

	const getLineChartData = () => {
		return [
			{
				id: 'Happiness',
				color: '#f472b6',
				data: moods.map((mood, idx) => {
					const date = new Date(mood.createdAt);
					const timeStr = date.toLocaleTimeString('en-US', {
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
				color: '#8b5cf6',
				data: moods.map((mood, idx) => {
					const date = new Date(mood.createdAt);
					const timeStr = date.toLocaleTimeString('en-US', {
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
	}, []);

	if (loading) {
		return <div className="text-gray-500">Loading moods...</div>;
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 p-8">
			<div className="max-w-7xl mx-auto">

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Mood Input Grid */}
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h2 className="text-2xl font-semibold">How are you feeling?</h2>
								<p className="text-gray-600 text-sm mt-1">
									{checkTodayLogged() ? (
										<span className="text-green-600 font-medium">✓ Mood logged today! Come back tomorrow</span>
									) : (
										'Click anywhere on the grid to log your current mood'
									)}
								</p>
							</div>
						</div>

						<div className="relative ml-8">
							<div
								className={`w-full aspect-square border-2 border-gray-300 rounded-lg relative overflow-hidden ${checkTodayLogged() ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'
									}`}
								onClick={handleMoodClick}
								style={{
									background: `
                    linear-gradient(to right, 
                      rgb(100, 100, 200) 0%, 
                      rgb(150, 200, 150) 50%, 
                      rgb(255, 200, 100) 100%
                    ),
                    linear-gradient(to bottom,
                      rgba(255, 255, 255, 0.7) 0%,
                      rgba(255, 255, 255, 0) 100%
                    )
                  `,
									backgroundBlendMode: 'overlay'
								}}
							>
								{/* Grid lines */}
								<div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
									{Array.from({ length: 16 }).map((_, i) => (
										<div key={i} className="border border-gray-200 border-opacity-30" />
									))}
								</div>

								{/* Plotted moods */}
								{moods.map((mood, idx) => {
									// Convert from -1 to 1 range back to 0 to 1 for positioning
									const xPos = (mood.moodX + 1) / 2;
									const yPos = (mood.moodY + 1) / 2;
									const date = new Date(mood.createdAt);
									const timestamp = date.toLocaleString('en-US', {
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
										hour12: false
									});

									return (
										<div
											key={mood.id}
											className="absolute w-4 h-4 bg-white border-2 border-pink-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
											style={{
												left: `${xPos * 100}%`,
												bottom: `${yPos * 100}%`
											}}
											title={`${timestamp}: ${getMoodLabel(mood.moodX, mood.moodY)}`}
										/>
									);
								})}

								{/* Quadrant labels */}
								<div className="absolute top-2 left-2 text-xs font-semibold text-gray-700 bg-white bg-opacity-70 px-2 py-1 rounded">
									Peaceful 😴
								</div>
								<div className="absolute top-2 right-2 text-xs font-semibold text-gray-700 bg-white bg-opacity-70 px-2 py-1 rounded">
									Excited 🤗
								</div>
								<div className="absolute bottom-2 left-2 text-xs font-semibold text-gray-700 bg-white bg-opacity-70 px-2 py-1 rounded">
									Stressed 😤
								</div>
								<div className="absolute bottom-2 right-2 text-xs font-semibold text-gray-700 bg-white bg-opacity-70 px-2 py-1 rounded">
									Content 😌
								</div>
							</div>

							{/* Axis labels */}
							<div className="flex justify-between mt-2 text-sm font-medium text-gray-700">
								<span>😢 Sad</span>
								<span className="text-gray-400">Happiness →</span>
								<span>😊 Happy</span>
							</div>
							<div className="absolute left-0 top-1/2 -ml-8 transform -translate-y-1/2">
								<div className="flex flex-col items-center gap-2">
									<span className="text-sm font-medium text-gray-700 transform -rotate-90 whitespace-nowrap origin-center">
										😌 Calm
									</span>
									<span className="text-xs text-gray-400 transform -rotate-90 whitespace-nowrap origin-center my-8">
										Energy
									</span>
									<span className="text-sm font-medium text-gray-700 transform -rotate-90 whitespace-nowrap origin-center">
										😤 Angry
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Mood History */}
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<div className="flex items-center gap-2 mb-4">
							<TrendingUp className="text-pink-600" size={24} />
							<h2 className="text-2xl font-semibold">Mood History</h2>
						</div>

						<div className="mb-6 max-h-48 overflow-y-auto">
							{moods.length === 0 ? (
								<p className="text-gray-400 text-center py-8">No mood entries yet. Click on the grid to start!</p>
							) : (
								moods.slice(0, 5).map((mood, idx) => {
									const date = new Date(mood.createdAt);
									const timestamp = date.toLocaleString('en-US', {
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
										hour12: false
									});

									return (
										<div key={mood.id} className="flex justify-between items-center py-2 border-b border-gray-100">
											<span className="text-sm text-gray-600">{timestamp}</span>
											<span className="font-medium">{getMoodLabel(mood.moodX, mood.moodY)}</span>
										</div>
									);
								})
							)}
						</div>

						{/* Line Chart */}
						{moods.length > 0 && (
							<div className="h-64">
								<ResponsiveLine
									data={getLineChartData()}
									margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
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
										legendOffset: 50,
										legendPosition: 'middle'
									}}
									axisLeft={{
										tickSize: 5,
										tickPadding: 5,
										tickRotation: 0,
										legend: 'Level (%)',
										legendOffset: -50,
										legendPosition: 'middle'
									}}
									pointSize={8}
									pointColor={{ theme: 'background' }}
									pointBorderWidth={2}
									pointBorderColor={{ from: 'serieColor' }}
									pointLabelYOffset={-12}
									useMesh={true}
									colors={['#f472b6', '#8b5cf6']}
									lineWidth={3}
									enableGridX={false}
									enableGridY={true}
									legends={[]}
								/>
							</div>
						)}

						<div className="flex gap-4 justify-center mt-4 text-sm">
							<div className="flex items-center gap-2">
								<div className="w-4 h-1 bg-pink-400 rounded"></div>
								<span>Happiness</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-4 h-1 bg-purple-500 rounded"></div>
								<span>Calmness</span>
							</div>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
					<div className="bg-white rounded-xl shadow p-4 text-center">
						<div className="text-2xl font-bold text-pink-600">{moods.length}</div>
						<div className="text-sm text-gray-600">Total Entries</div>
					</div>
					<div className="bg-white rounded-xl shadow p-4 text-center">
						<div className="text-2xl font-bold text-purple-600">
							{moods.length > 0 ? (moods.reduce((sum, m) => sum + ((m.moodX + 1) / 2), 0) / moods.length * 100).toFixed(0) : 0}%
						</div>
						<div className="text-sm text-gray-600">Avg Happiness</div>
					</div>
					<div className="bg-white rounded-xl shadow p-4 text-center">
						<div className="text-2xl font-bold text-indigo-600">
							{moods.length > 0 ? (moods.reduce((sum, m) => sum + ((m.moodY + 1) / 2), 0) / moods.length * 100).toFixed(0) : 0}%
						</div>
						<div className="text-sm text-gray-600">Avg Calmness</div>
					</div>
				</div>
			</div>
		</div>
	);
}