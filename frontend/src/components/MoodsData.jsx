import { useEffect, useState } from 'react';
import { Heart, TrendingUp, Trash2 } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import WeekBar from './WeekBar';
import IconButton from './IconButton';
import toast from 'react-hot-toast';
import CardNoIcon from './CardNoIcon';

function MoodTrendChart({ filteredMoods }) {
const getLineChartData = () => {
    const processMoodData = (mood) => {
      const date = new Date(mood.createdAt);
      const timeStr = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return { timeStr, moodY: mood.moodY.toFixed(2), moodX: mood.moodX.toFixed(2) };
    };

    const processedData = filteredMoods.map(processMoodData).reverse();

    return [
      {
        id: 'Happiness',
        data: processedData.map((data) => ({
          x: data.timeStr,
          y: data.moodY
        }))
      },
      {
        id: 'Calmness',
        data: processedData.map((data) => ({
          x: data.timeStr,
          y: data.moodX
        }))
      }
    ];
  };

  return (
    <div className="bg-indigo-900 text-purple-100 rounded-lg border border-violet-400 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <TrendingUp />
        <h2 className="text-xl sm:text-2xl font-bold">Mood Trends</h2>
      </div>

      {filteredMoods.length === 0 ? (
        <p className="text-violet-300 text-xs sm:text-sm text-center py-6 sm:py-8">No mood entries for this week. Go to Logs page to capture your mood!</p>
      ) : (
        <>
          <div className="h-48 sm:h-56 lg:h-64">
            <ResponsiveLine
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#a684ff'
                    },
                  },
                  legend: {
                    text: {
                      fill: '#a684ff'
                    },
                  },
                },
                crosshair: {
                  line: {
                    stroke: '#a684ff'
                  }
                },
                tooltip: {
                  container: {
                    background: '#372aac',
                    color: '#a684ff',
                    border: '1px solid #a684ff',
                    borderRadius: 4,
                    padding: 12,
                  },
                },
								legends: {
									text: {
										fontSize: 14,
										fill: "#f3e8ff",
									},
								},
              }}
              data={getLineChartData()}
              margin={{ top: 0, right: 20, bottom: 100, left: 20 }}
              yScale={{
                type: 'linear',
                min: -1,
                max: 1
              }}
              curve='monotoneX'
              enableSlices="x"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Time',
                legendOffset: 72,
                legendPosition: 'middle',
              }}
              axisLeft={null}
              pointSize={8}
              useMesh={true}
              colors={['#3b82f6', '#ef4444']}
              lineWidth={4}
              enableGridX={false}
              enableGridY={false}
              legends={[{
								anchor: 'bottom',
								direction: 'row',
								translateY: 100,
								itemWidth: 100,
								itemHeight: 20,
								symbolShape: 'circle'
							}]}
              markers={[{
								axis: 'y',
								lineStyle: {
									stroke: '#F3E4E6',
									strokeWidth: 1
								},
								value: 0
              }]}
            />
          </div>
        </>
      )}
    </div>
  );
}

function MoodStats({ filteredMoods }) {
	function avg(axis) {
		return filteredMoods.length > 0 ? (filteredMoods.reduce((sum, m) => sum + ((m[axis] + 1) / 2), 0) / filteredMoods.length * 100).toFixed(0) : 0;
	}

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
      <CardNoIcon
        value={filteredMoods.length}
        label="Entries this week"
      />
      <CardNoIcon
        value={`${avg('moodX')}%`}
        label="Average Happiness"
      />
      <CardNoIcon
        value={`${avg('moodY')}%`}
        label="Average Calmness"
      />
    </div>
  );
}

function MoodEntryItem({ mood, handleDeleteMood }) {
  const date = new Date(mood.createdAt);
  const timestamp = date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

	const getMoodLabel = (moodX, moodY) => {
		const happy = (moodX + 1) / 2;
		const calm = (moodY + 1) / 2;

		const happinessPercent = Math.round(happy * 100);
		const calmnessPercent = Math.round(calm * 100);

		return `Happiness: ${happinessPercent}% | Calmness: ${calmnessPercent}%`;
	};

  return (
    <div className="p-3 border border-violet-400 rounded bg-indigo-800 hover:bg-indigo-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-purple-100 mb-1">{getMoodLabel(mood.moodX, mood.moodY)}</p>
          <p className="text-xs text-violet-300">{timestamp}</p>
        </div>
        <div className="flex items-center">
          <IconButton
            onClick={() => handleDeleteMood(mood.id)}
            icon={Trash2}
            title="Delete mood"
            hasBorder={true}
          />
        </div>
      </div>
    </div>
  );
}

function AllMoodEntries({ moods, handleDeleteMood }) {
  return (
    <div className="bg-indigo-900 rounded-lg border border-violet-400 p-4 sm:p-6 mt-4 sm:mt-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Heart className="text-purple-100 w-5 h-5 sm:w-6 sm:h-6" />
        <h2 className="text-xl sm:text-2xl font-bold text-purple-100">All Mood Entries</h2>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {moods.length === 0 ? (
          <p className="text-violet-300 text-xs sm:text-sm text-center py-6 sm:py-8">No mood entries yet. Go to Logs page to log your mood!</p>
        ) : (
          moods.map((mood) => (
            <MoodEntryItem key={mood.id} mood={mood} handleDeleteMood={handleDeleteMood} />
          ))
        )}
      </div>
    </div>
  );
}

export default function MoodsData() {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

	const getWeekDates = (offset) => {
		const today = new Date();
		const currentDay = today.getDay();
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

  const handleDeleteMood = async (moodId) => {
    if (!confirm('Are you sure you want to delete this mood entry?'))
      return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods/${moodId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
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

  const weekDates = getWeekDates(currentWeekOffset);
  const filteredMoods = moods.filter(mood => {
    const moodDate = new Date(mood.createdAt);
    const startOfWeek = weekDates[0];
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(weekDates[6]);
    endOfWeek.setHours(23, 59, 59, 999);
    return moodDate >= startOfWeek && moodDate <= endOfWeek;
  });

  if (loading) {
    return <div className="text-gray-500">Loading moods...</div>;
  }

  return (
    <div className="min-h-screen bg-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="bg-indigo-900 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 border border-violet-400">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-purple-100 mb-1">
                Your Moods
              </h3>
              <p className="text-xs sm:text-sm text-violet-300">
                Click anywhere on the grid to log your current mood
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <WeekBar currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <MoodTrendChart filteredMoods={filteredMoods} />
        </div>

        <MoodStats filteredMoods={filteredMoods} />

        <AllMoodEntries moods={moods} handleDeleteMood={handleDeleteMood} />
      </div>
    </div>
  );
}