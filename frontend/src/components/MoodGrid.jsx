import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function MoodGrid() {
  const [moods, setMoods] = useState([]);
  const [canLog, setCanLog] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Function to check if a new mood can be logged (cooldown logic)
  const checkCooldown = useCallback(() => {
    if (moods.length === 0) {
      setCanLog(true);
      setTimeRemaining(0);
      return;
    }

    const lastMood = moods[0];
    const lastMoodTime = new Date(lastMood.createdAt).getTime();
    const now = Date.now();
    const timeDiff = now - lastMoodTime;
    const waitInterval = 5 * 60 * 1000; // 5 minutes in ms

    if (timeDiff < waitInterval) {
      setCanLog(false);
      setTimeRemaining(Math.ceil((waitInterval - timeDiff) / 60000)); // minutes remaining
    } else {
      setCanLog(true);
      setTimeRemaining(0);
    }
  }, [moods]);

  // Function to handle logging a new mood on click
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

  // useEffect to fetch initial moods
  useEffect(() => {
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
  }, []); // Runs once on mount

  // useEffect for cooldown check and interval
  useEffect(() => {
    checkCooldown();

    const interval = setInterval(() => {
      checkCooldown();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [moods, checkCooldown]); // Reruns when moods change or checkCooldown memo changes

  return (
    <MoodGridBody
      canLog={canLog}
      timeRemaining={timeRemaining}
      moods={moods}
      handleMoodClick={handleMoodClick}
    />
  );
}

function MoodGridBody({ canLog, timeRemaining, moods, handleMoodClick }) {
  return (
    <div className="relative ml-4 sm:ml-6 lg:ml-8">
      {!canLog && (
        <div className="mb-3 p-2 bg-amber-800 border border-yellow-500 rounded text-center">
          <p className="text-xs sm:text-sm text-yellow-300">
            ⏳ Please wait {timeRemaining} minute(s) before logging another mood
          </p>
        </div>
      )}
      <div
        className={`w-full aspect-square border-2 border-violet-400 rounded-lg relative max-w-md mx-auto ${canLog ? 'cursor-crosshair' : 'cursor-not-allowed opacity-60'}`}
        onClick={handleMoodClick}
      >
        <PlottedMoods moods={moods} />
        <AxisLabels />
      </div>
    </div>
  );
}

function PlottedMoods({ moods }) {
  return (
    <>
      {moods.map((mood) => {
        const xPos = 50 + (mood.moodX * 50);
        const yPos = 50 - (mood.moodY * 50);

        return (
          <div
            key={mood.id}
            className="absolute w-2 h-2 border-2 border-violet-100 rounded-full transform -translate-x-1/2 -translate-y-1/2-lg"
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`
            }}
          />
        );
      })}
    </>
  );
}

function AxisLabels() {
  const labels = [
    {
      position: 'top-0 left-1/2 transform -translate-x-1/2',
      text: 'Calm ↑',
      textColor: 'text-pink-300',
    },
    {
      position: 'bottom-0 left-1/2 transform -translate-x-1/2',
      text: 'Angry ↓',
      textColor: 'text-red-300',
    },
    {
      position: 'left-0 top-1/2 transform -translate-y-1/2',
      text: '← Sad',
      textColor: 'text-cyan-300',
    },
    {
      position: 'right-0 top-1/2 transform -translate-y-1/2',
      text: 'Happy →',
      textColor: 'text-yellow-300',
    },
  ];

  return (
    <div className="relative w-full h-full">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
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

      {labels.map((label, index) => (
        <div
          key={index}
          className={`absolute text-[10px] sm:text-xs font-semibold bg-indigo-900 px-1.5 sm:px-2 py-0.5 sm:py-1 border border-violet-400 rounded ${label.position} ${label.textColor}`}
        >
          {label.text}
        </div>
      ))}
    </div>
  );
}
