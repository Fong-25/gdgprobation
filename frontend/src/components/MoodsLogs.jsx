import { useState, useEffect } from 'react';
import { Calendar, Heart } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8 border border-black">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="w-8 h-8 text-black" />
                        <h1 className="text-3xl font-bold text-black">All Moods</h1>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 border border-black bg-gray-100 rounded">
                            <p className="text-sm text-gray-700">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-700">Loading moods...</p>
                        </div>
                    ) : moods.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-700">No moods logged yet. Start by logging your first mood!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {moods.map((mood) => {
                                const stats = getMoodStats(mood.moodX, mood.moodY);
                                return (
                                    <div
                                        key={mood.id}
                                        className="p-4 border border-black rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="text-lg font-medium text-black">
                                                        {getMoodLabel(mood.moodX, mood.moodY)}
                                                    </p>
                                                    <span className="px-2 py-1 bg-pink-500 text-white text-xs font-semibold rounded">
                                                        H: {stats.happyPercent}%
                                                    </span>
                                                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded">
                                                        C: {stats.calmPercent}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(mood.createdAt)}</span>
                                                    <span className="text-gray-500">•</span>
                                                    <span className="text-gray-600">
                                                        {formatRelativeDate(mood.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-600">
                                                    <span>Coordinates: ({mood.moodX.toFixed(2)}, {mood.moodY.toFixed(2)})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-black">
                        <p className="text-sm text-gray-700 text-center">
                            Total moods logged: <span className="font-bold text-black">{moods.length}</span>
                        </p>
                        {moods.length > 0 && (
                            <div className="mt-2 flex justify-center gap-6 text-sm text-gray-700">
                                <span>
                                    Avg Happiness: <span className="font-bold text-pink-600">
                                        {(moods.reduce((sum, m) => sum + ((m.moodX + 1) / 2), 0) / moods.length * 100).toFixed(0)}%
                                    </span>
                                </span>
                                <span>
                                    Avg Calmness: <span className="font-bold text-purple-600">
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