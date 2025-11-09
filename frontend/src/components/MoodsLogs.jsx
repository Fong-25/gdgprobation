import { useState, useEffect } from 'react';
import { Calendar, Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MoodsLogs = () => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoods = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.moods) ? json.moods : json;
          // Already sorted by createdAt desc from backend
          setMoods(list);
        } else {
          console.warn('Failed to fetch moods');
          setError('Could not load moods from server.');
        }
      } catch (err) {
        console.warn('Fetch moods error', err);
        setError('Could not load moods from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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

  const getMoodStats = (moodX, moodY) => {
    // Convert from -1 to 1 range to percentage
    const happyPercent = ((moodX + 1) / 2 * 100).toFixed(0);
    const calmPercent = ((moodY + 1) / 2 * 100).toFixed(0);
    return { happyPercent, calmPercent };
  };

  const handleDelete = async (moodId) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods/${moodId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMoods(moods.filter(m => m.id !== moodId));
        toast.success('Mood deleted successfully');
      } else {
        toast.error('Failed to delete mood');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-indigo-900 rounded-lg border border-violet-400 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-100 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-100">All Moods</h1>
          </div>

          {error && (
            <div className="mb-4 p-2 sm:p-3 border border-violet-400 bg-indigo-800 rounded">
              <p className="text-xs sm:text-sm text-violet-300">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-violet-300">Loading moods...</p>
            </div>
          ) : moods.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-violet-300">No moods logged yet. Start by logging your first mood!</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {moods.map((mood) => {
                const stats = getMoodStats(mood.moodX, mood.moodY);
                return (
                  <div
                    key={mood.id}
                    className="p-3 sm:p-4 border border-violet-400 rounded bg-indigo-800 hover:bg-indigo-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <p className="text-base sm:text-lg font-bold text-purple-100">
                            {getMoodLabel(mood.moodX, mood.moodY)}
                          </p>
                          <span className="px-2 py-1 bg-indigo-950 text-white text-xs font-semibold rounded whitespace-nowrap">
                            H: {stats.happyPercent}%
                          </span>
                          <span className="px-2 py-1 bg-gray-700 text-white text-xs font-semibold rounded whitespace-nowrap">
                            C: {stats.calmPercent}%
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-violet-300">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="whitespace-nowrap">{formatDate(mood.createdAt)}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600 whitespace-nowrap">
                            {formatRelativeDate(mood.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] sm:text-xs text-gray-600">
                          <span>Coordinates: ({mood.moodX.toFixed(2)}, {mood.moodY.toFixed(2)})</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDelete(mood.id)}
                          className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400"
                          title="Delete mood"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-violet-400">
            <p className="text-xs sm:text-sm text-violet-300 text-center">
              Total moods logged: <span className="font-bold text-purple-100">{moods.length}</span>
            </p>
            {moods.length > 0 && (
              <div className="mt-2 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-xs sm:text-sm text-violet-300">
                <span>
                  Avg Happiness: <span className="font-bold text-purple-100">
                    {(moods.reduce((sum, m) => sum + ((m.moodX + 1) / 2), 0) / moods.length * 100).toFixed(0)}%
                  </span>
                </span>
                <span>
                  Avg Calmness: <span className="font-bold text-purple-100">
                    {(moods.reduce((sum, m) => sum + ((m.moodY + 1) / 2), 0) / moods.length * 100).toFixed(0)}%
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodsLogs;