import { useState, useEffect } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { data as fallbackData } from '../data';

const ThoughtsLogs = () => {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 border border-black">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-8 h-8 text-black" />
            <h1 className="text-3xl font-bold text-black">All Thoughts</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-black bg-gray-100 rounded">
              <p className="text-sm text-gray-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-700">Loading thoughts...</p>
            </div>
          ) : thoughts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700">No thoughts yet. Start by adding one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {thoughts.map((thought) => (
                <div
                  key={thought.id}
                  className="p-4 border border-black rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-medium text-black mb-2">
                        {thought.text}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(thought.created_at || thought.createdAt)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {formatRelativeDate(thought.created_at || thought.createdAt)}
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
              Total thoughts: <span className="font-bold text-black">{thoughts.length}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtsLogs;
