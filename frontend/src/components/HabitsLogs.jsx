import { useState, useEffect } from 'react';
import { Calendar, CheckSquare } from 'lucide-react';
import { data as fallbackData } from '../data';

const HabitsLogs = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/habits`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.habits) ? json.habits : json;
          // Sort by creation date descending (newest first)
          const sorted = list.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt);
            const dateB = new Date(b.created_at || b.createdAt);
            return dateB - dateA;
          });
          setHabits(sorted);
        } else {
          console.warn('Failed to fetch habits, using fallback data');
          const sorted = (fallbackData.habits || []).sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt);
            const dateB = new Date(b.created_at || b.createdAt);
            return dateB - dateA;
          });
          setHabits(sorted);
        }
      } catch (err) {
        console.warn('Fetch habits error, using fallback', err);
        const sorted = (fallbackData.habits || []).sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt);
          const dateB = new Date(b.created_at || b.createdAt);
          return dateB - dateA;
        });
        setHabits(sorted);
        setError('Could not load habits from server. Showing sample data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
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

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'per_day':
        return 'Daily';
      case 'per_week':
        return 'Weekly';
      case 'per_month':
        return 'Monthly';
      default:
        return frequency;
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 border border-black">
          <div className="flex items-center gap-3 mb-6">
            <CheckSquare className="w-8 h-8 text-black" />
            <h1 className="text-3xl font-bold text-black">All Habits</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-black bg-gray-100 rounded">
              <p className="text-sm text-gray-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-700">Loading habits...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700">No habits yet. Start by adding one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-4 border border-black rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-medium text-black">
                          {habit.name}
                        </p>
                        <span className="px-2 py-1 bg-black text-white text-xs font-semibold rounded">
                          {getFrequencyLabel(habit.frequency)}
                        </span>
                        {habit.is_tracked !== undefined && !habit.is_tracked && (
                          <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded">
                            Not Tracked
                          </span>
                        )}
                        {habit.isTracked !== undefined && !habit.isTracked && (
                          <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded">
                            Not Tracked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(habit.created_at || habit.createdAt)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {formatRelativeDate(habit.created_at || habit.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-black">
            <p className="text-sm text-gray-700 text-center">
              Total habits: <span className="font-bold text-black">{habits.length}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitsLogs;
