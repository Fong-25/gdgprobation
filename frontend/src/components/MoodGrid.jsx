import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function MoodGrid() {
	const [moods, setMoods] = useState([]);
	const [canLog, setCanLog] = useState(true);
	const [timeRemaining, setTimeRemaining] = useState(0);

	const getMoodLabel = (moodX, moodY) => {
		const happy = (moodX + 1) / 2;
		const calm = (moodY + 1) / 2;

		const happinessPercent = Math.round(happy * 100);
		const calmnessPercent = Math.round(calm * 100);

		return `Happiness: ${happinessPercent}% | Calmness: ${calmnessPercent}%`;
	};

	const checkCooldown = () => {
		if (moods.length === 0) {
			setCanLog(true);
			setTimeRemaining(0);
			return;
		}

		const lastMood = moods[0];
		const lastMoodTime = new Date(lastMood.createdAt).getTime();
		const now = Date.now();
		const timeDiff = now - lastMoodTime;
		const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

		if (timeDiff < thirtyMinutes) {
			setCanLog(false);
			setTimeRemaining(Math.ceil((thirtyMinutes - timeDiff) / 60000)); // minutes remaining
		} else {
			setCanLog(true);
			setTimeRemaining(0);
		}
	};

	const handleMoodClick = async (e) => {
		if (!canLog) {
			toast.error(`Please wait ${timeRemaining} minute(s) before logging another mood`);
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;

		const moodX = (x * 2) - 1;
		const moodY = 1 - (y * 2);

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
				toast.success('Mood logged successfully!');
				setMoods([data.mood, ...moods]);
			} else {
				toast.error(data.message || 'Failed to log mood');
			}
		} catch (error) {
			console.error("Add mood error:", error);
			toast.error('Failed to log mood. Please try again.');
		}
	};

	useEffect(() => {
		// Fetch recent moods to display on the grid
		const fetchMoods = async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods`, {
					method: "GET",
					credentials: "include",
				});
				const data = await res.json();
				if (res.ok) {
					setMoods(data.moods.slice(0, 20)); // Show last 20 moods
				}
			} catch (error) {
				console.error("Fetch moods error:", error);
			}
		};

		fetchMoods();
	}, []);

	// Check cooldown whenever moods change
	useEffect(() => {
		checkCooldown();
		
		// Update cooldown timer every minute
		const interval = setInterval(() => {
			checkCooldown();
		}, 60000); // Check every minute

		return () => clearInterval(interval);
	}, [moods]);

	return (
		<div className="relative ml-4 sm:ml-6 lg:ml-8">
			{!canLog && (
				<div className="mb-3 p-2 bg-yellow-50 border border-yellow-300 rounded text-center">
					<p className="text-xs sm:text-sm text-yellow-800">
						⏳ Please wait {timeRemaining} minute(s) before logging another mood
					</p>
				</div>
			)}
			<div
				className={`w-full aspect-square border-2 border-black rounded-lg relative overflow-hidden bg-white max-w-md mx-auto ${canLog ? 'cursor-crosshair' : 'cursor-not-allowed opacity-60'}`}
				onClick={handleMoodClick}
			>
				{/* Grid lines - centered axes */}
				<svg className="absolute inset-0 w-full h-full pointer-events-none">
					<line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#000" strokeWidth="2" />
					<line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#000" strokeWidth="2" />
					{Array.from({ length: 4 }).map((_, i) => {
						const pos = (i + 1) * 25;
						return (
							<g key={i}>
								<line x1={`${pos}%`} y1="0%" x2={`${pos}%`} y2="100%" stroke="#d1d5db" strokeWidth="1" />
								<line x1="0%" y1={`${pos}%`} x2="100%" y2={`${pos}%`} stroke="#d1d5db" strokeWidth="1" />
							</g>
						);
					})}
				</svg>

				{/* Plotted moods */}
				{moods.map((mood, idx) => {
					const xPos = 50 + (mood.moodX * 50);
					const yPos = 50 - (mood.moodY * 50);
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
							className="absolute w-4 h-4 bg-black border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
							style={{
								left: `${xPos}%`,
								top: `${yPos}%`
							}}
							title={`${timestamp}: ${getMoodLabel(mood.moodX, mood.moodY)}`}
						/>
					);
				})}

				{/* Axis labels */}
				<div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-black bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 border border-black rounded">
					Calm ↑
				</div>
				<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-black bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 border border-black rounded">
					Angry ↓
				</div>
				<div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[10px] sm:text-xs font-semibold text-black bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 border border-black rounded">
					← Sad
				</div>
				<div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[10px] sm:text-xs font-semibold text-black bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 border border-black rounded">
					Happy →
				</div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-semibold text-black bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 border border-black rounded">
					0
				</div>
			</div>
		</div>
	);
}
