import { useState } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';

export default function MoodsForm() {
  const [moods, setMoods] = useState([
    { timestamp: '2025-10-28 10:00', happy: 0.7, calm: 0.8, date: '2025-10-28' },
    { timestamp: '2025-10-29 14:00', happy: 0.5, calm: 0.4, date: '2025-10-29' },
    { timestamp: '2025-10-30 09:00', happy: 0.8, calm: 0.9, date: '2025-10-30' },
  ]);
  const [showInput, setShowInput] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if mood already logged today
  const checkTodayLogged = () => {
    const today = getTodayDate();
    return moods.some(mood => mood.date === today);
  };

  const getMoodLabel = (happy, calm) => {
    if (happy > 0.6 && calm > 0.6) return 'Content 😌';
    if (happy > 0.6 && calm < 0.4) return 'Excited 🤗';
    if (happy < 0.4 && calm > 0.6) return 'Peaceful 😔';
    if (happy < 0.4 && calm < 0.4) return 'Stressed 😤';
    if (happy > 0.5) return 'Happy 😊';
    if (calm > 0.5) return 'Calm 😐';
    if (happy < 0.5 && calm < 0.5) return 'Upset 😞';
    return 'Neutral 😶';
  };

  const handleMoodClick = (e) => {
    // Check if already logged today
    if (checkTodayLogged()) {
      alert('You have already logged your mood today! Come back tomorrow 😊');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;

    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    const newMood = {
      timestamp,
      date: getTodayDate(),
      happy: Math.max(0, Math.min(1, x)),
      calm: Math.max(0, Math.min(1, y))
    };

    setMoods([...moods, newMood]);
    setTodayLogged(true);
    setShowInput(false);
  };

  const getLineChartData = () => {
    return [
      {
        id: 'Happiness',
        color: '#f472b6',
        data: moods.map((mood, idx) => ({
          x: mood.timestamp.split(' ')[1] || `Entry ${idx + 1}`,
          y: (mood.happy * 100).toFixed(0)
        }))
      },
      {
        id: 'Calmness',
        color: '#8b5cf6',
        data: moods.map((mood, idx) => ({
          x: mood.timestamp.split(' ')[1] || `Entry ${idx + 1}`,
          y: (mood.calm * 100).toFixed(0)
        }))
      }
    ];
  };

  const getQuadrantColor = (x, y) => {
    const happy = x / 400;
    const calm = y / 400;
    
    const r = Math.floor(255 * (1 - calm));
    const g = Math.floor(255 * happy);
    const b = Math.floor(200 * calm);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
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
                className={`w-full aspect-square border-2 border-gray-300 rounded-lg relative overflow-hidden ${
                  checkTodayLogged() ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'
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
                {moods.map((mood, idx) => (
                  <div
                    key={idx}
                    className="absolute w-4 h-4 bg-white border-2 border-pink-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                    style={{
                      left: `${mood.happy * 100}%`,
                      bottom: `${mood.calm * 100}%`
                    }}
                    title={`${mood.timestamp}: ${getMoodLabel(mood.happy, mood.calm)}`}
                  />
                ))}

                {/* Quadrant labels */}
                <div className="absolute top-2 left-2 text-xs font-semibold text-gray-700 bg-white bg-opacity-70 px-2 py-1 rounded">
                  Peaceful 😔
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
              {moods.slice(-5).reverse().map((mood, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{mood.timestamp}</span>
                  <span className="font-medium">{getMoodLabel(mood.happy, mood.calm)}</span>
                </div>
              ))}
            </div>

            {/* Line Chart */}
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
              {moods.length > 0 ? (moods.reduce((sum, m) => sum + m.happy, 0) / moods.length * 100).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Happiness</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {moods.length > 0 ? (moods.reduce((sum, m) => sum + m.calm, 0) / moods.length * 100).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Calmness</div>
          </div>
        </div>
      </div>
    </div>
  );
}