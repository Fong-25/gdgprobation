import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';
import { data as fallbackData } from '../data';
import toast from 'react-hot-toast';

const ThoughtsLogs = () => {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const fetchThoughts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.thoughts) ? json.thoughts : json;
          // Sort by date descending (newest first)
          const sorted = list.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt);
            const dateB = new Date(b.created_at || b.createdAt);
            return dateB - dateA;
          });
          setThoughts(sorted);
        } else {
          console.warn('Failed to fetch thoughts, using fallback data');
          const sorted = (fallbackData.thoughts || []).sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt);
            const dateB = new Date(b.created_at || b.createdAt);
            return dateB - dateA;
          });
          setThoughts(sorted);
        }
      } catch (err) {
        console.warn('Fetch thoughts error, using fallback', err);
        const sorted = (fallbackData.thoughts || []).sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt);
          const dateB = new Date(b.created_at || b.createdAt);
          return dateB - dateA;
        });
        setThoughts(sorted);
        setError('Could not load thoughts from server. Showing sample data.');
      } finally {
        setLoading(false);
      }
    };

    fetchThoughts();
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

  const handleDelete = async (thoughtId) => {
    if (!confirm('Are you sure you want to delete this thought?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts/${thoughtId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setThoughts(thoughts.filter(t => t.id !== thoughtId));
        toast.success('Thought deleted successfully');
      } else {
        toast.error('Failed to delete thought');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    }
  };

  const startEdit = (thought) => {
    setEditingId(thought.id);
    setEditText(thought.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (thoughtId) => {
    if (!editText.trim()) {
      toast.error('Thought cannot be empty');
      return;
    }

    const wordCount = editText.trim().split(/\s+/).length;
    if (wordCount > 5) {
      toast.error('Thought must be 5 words or less');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts/${thoughtId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText })
      });

      if (res.ok) {
        setThoughts(thoughts.map(t => 
          t.id === thoughtId ? { ...t, text: editText } : t
        ));
        toast.success('Thought updated successfully');
        cancelEdit();
      } else {
        toast.error('Failed to update thought');
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
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-black">All Thoughts</h1>
          </div>

          {error && (
            <div className="mb-4 p-2 sm:p-3 border border-black bg-gray-50 rounded">
              <p className="text-xs sm:text-sm text-gray-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-700">Loading thoughts...</p>
            </div>
          ) : thoughts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-700">No thoughts yet. Start by adding one!</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {thoughts.map((thought) => (
                <div
                  key={thought.id}
                  className="p-3 sm:p-4 border border-black rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {editingId === thought.id ? (
                        <div className="mb-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-black rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                            autoFocus
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            {editText.trim().split(/\s+/).filter(w => w).length}/5 words
                          </p>
                        </div>
                      ) : (
                        <p className="text-base sm:text-lg font-medium text-black mb-2 break-words">
                          {thought.text}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(thought.created_at || thought.createdAt)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 whitespace-nowrap">
                          {formatRelativeDate(thought.created_at || thought.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingId === thought.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(thought.id)}
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
                            onClick={() => startEdit(thought)}
                            className="p-2 text-black hover:bg-gray-200 rounded transition-colors border border-gray-300 hover:border-black"
                            title="Edit thought"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(thought.id)}
                            className="p-2 text-black hover:bg-gray-200 rounded transition-colors border border-gray-300 hover:border-black"
                            title="Delete thought"
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
              Total thoughts: <span className="font-bold text-black">{thoughts.length}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtsLogs;
