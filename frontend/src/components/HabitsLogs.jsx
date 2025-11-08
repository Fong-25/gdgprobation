import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Edit2, Trash2, Check, X } from 'lucide-react';
import { data as fallbackData } from '../data';
import toast from 'react-hot-toast';

const HabitsLogs = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

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

  const handleDelete = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setHabits(habits.filter(h => h.id !== habitId));
        toast.success('Habit deleted successfully');
      } else {
        toast.error('Failed to delete habit');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    }
  };

  const startEdit = (habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (habitId) => {
    if (!editName.trim()) {
      toast.error('Habit name cannot be empty');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/habits/${habitId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });

      if (res.ok) {
        setHabits(habits.map(h => 
          h.id === habitId ? { ...h, name: editName } : h
        ));
        toast.success('Habit updated successfully');
        cancelEdit();
      } else {
        toast.error('Failed to update habit');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-black p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-black">All Habits</h1>
          </div>

          {error && (
            <div className="mb-4 p-2 sm:p-3 border border-black bg-gray-50 rounded">
              <p className="text-xs sm:text-sm text-gray-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-700">Loading habits...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-700">No habits yet. Start by adding one!</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-3 sm:p-4 border border-black rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {editingId === habit.id ? (
                        <div className="mb-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <p className="text-base sm:text-lg font-medium text-black">
                            {habit.name}
                          </p>
                          <span className="px-2 py-1 bg-black text-white text-xs font-semibold rounded whitespace-nowrap">
                            {getFrequencyLabel(habit.frequency)}
                          </span>
                          {habit.is_tracked !== undefined && !habit.is_tracked && (
                            <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded whitespace-nowrap">
                              Not Tracked
                            </span>
                          )}
                          {habit.isTracked !== undefined && !habit.isTracked && (
                            <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded whitespace-nowrap">
                              Not Tracked
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(habit.created_at || habit.createdAt)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 whitespace-nowrap">
                          {formatRelativeDate(habit.created_at || habit.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingId === habit.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(habit.id)}
                            className="p-2 text-black hover:bg-gray-200 rounded transition-colors border border-gray-300 hover:border-black"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-black hover:bg-gray-200 rounded transition-colors border border-gray-300 hover:border-black"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(habit)}
                            className="p-2 text-black hover:bg-gray-200 rounded transition-colors border border-gray-300 hover:border-black"
                            title="Edit habit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(habit.id)}
                            className="p-2 text-black hover:bg-gray-200 rounded transition-colors border border-gray-300 hover:border-black"
                            title="Delete habit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-black">
            <p className="text-xs sm:text-sm text-gray-700 text-center">
              Total habits: <span className="font-bold text-black">{habits.length}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitsLogs;
