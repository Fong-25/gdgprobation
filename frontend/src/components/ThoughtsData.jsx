import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Network, FileText, GitBranch, Check, X, Pencil, Trash2  } from 'lucide-react';
import WeekBar from './WeekBar';
import CardNoIcon from './CardNoIcon';
import { data as fallbackData } from '../data';
import toast from 'react-hot-toast';

const TopConnections = ({ topPairs }) => {
  return (
    <div className="bg-indigo-900 text-purple-100 rounded-lg shadow p-4 sm:p-6 border border-violet-400 order-1 lg:order-2">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <h2 className="text-lg sm:text-xl font-bold">Top Connections</h2>
      </div>
      <div className="p-2 space-y-2 max-h-[300px] sm:max-h-[400px] lg:max-h-[550px] overflow-y-auto">
        {topPairs.map(([pair, count], idx) => {
          const [word1, word2] = pair.split('|||');
          return (
            <div key={idx} className="p-2 sm:p-3 bg-indigo-900 rounded-lg border border-violet-400">
              <div className="grid grid-cols-[1fr_auto_1fr] mb-1 gap-2">
                <span className="truncate">{word1}</span>
                <span>↔</span>
                <span className="truncate text-end">{word2}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="px-2 py-1 bg-indigo-950 rounded-full text-xs font-semibold">
                  {count}x
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ThoughtItem = ({ thought, editingId, editText, setEditText, startEdit, cancelEdit, saveEdit, handleDelete }) => {
  const date = new Date(thought.created_at || thought.createdAt);
  const timestamp = date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div key={thought.id} className="p-3 border border-violet-400 rounded bg-indigo-800 hover:bg-indigo-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editingId === thought.id ? (
            <div className="mb-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit(thought.id);
                  }
                }}
                className="w-full px-3 py-2 border-2 border-violet-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                autoFocus
              />
            </div>
          ) : (
            <p className="text-sm font-medium text-purple-100 mb-1">{thought.text}</p>
          )}
          <p className="text-xs text-violet-300">{timestamp}</p>
        </div>
        <div className="flex items-center gap-1">
          {editingId === thought.id ? (
            <>
              <button
                onClick={() => saveEdit(thought.id)}
                className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400"
                title="Save"
              >
                <Check />
              </button>
              <button
                onClick={cancelEdit}
                className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400"
                title="Cancel"
              >
                <X />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(thought)}
                disabled={editingId !== null}
                className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Edit thought"
              >
                <Pencil />
              </button>
              <button
                onClick={() => handleDelete(thought.id)}
                className="p-2 text-purple-100 hover:bg-violet-800 rounded transition-colors border border-gray-300 hover:border-violet-400"
                title="Delete thought"
              >
                <Trash2 />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AllThoughts = ({ thoughts, editingId, editText, setEditText, startEdit, cancelEdit, saveEdit, handleDelete }) => {
  return (
    <div className="bg-indigo-900 rounded-lg shadow p-4 sm:p-6 border border-violet-400 mt-4 sm:mt-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-100 shrink-0" />
        <h2 className="text-lg sm:text-xl font-bold text-purple-100">All Thoughts</h2>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {thoughts.length === 0 ? (
          <p className="text-violet-300 text-xs sm:text-sm text-center py-6 sm:py-8">No thoughts yet. Go to Logs page to add one!</p>
        ) : (
          thoughts.map((thought) => (
            <ThoughtItem
              key={thought.id}
              thought={thought}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              saveEdit={saveEdit}
              handleDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

const NetworkGraph = ({ nodes, edges }) => {
  const canvasRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const clampCamera = (cam, width, height) => {
    const MAX_PAN = Math.max(width, height) * 0.6;
    const clampedX = Math.max(-MAX_PAN, Math.min(MAX_PAN, cam.x));
    const clampedY = Math.max(-MAX_PAN, Math.min(MAX_PAN, cam.y));
    const clampedZoom = Math.max(0.4, Math.min(3, cam.zoom));
    return { x: clampedX, y: clampedY, zoom: clampedZoom };
  };

  useEffect(() => {
    if (nodes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const handleWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.4, Math.min(3, camera.zoom * zoomFactor));
      const worldX = (mouseX - width / 2 - camera.x) / camera.zoom;
      const worldY = (mouseY - height / 2 - camera.y) / camera.zoom;
      setCamera(prev => clampCamera({
        x: prev.x - worldX * (newZoom - prev.zoom),
        y: prev.y - worldY * (newZoom - prev.zoom),
        zoom: newZoom
      }, width, height));
    };
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setCamera(prev => clampCamera({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }, width, height));
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    let animationId;
    const animate = () => {
      ctx.fillStyle = '#312c85';
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + camera.x, height / 2 + camera.y);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-width / 2, -height / 2);
      const NODE_DAMPING = 0.82;
      const MAX_SPEED = 2;
      nodes.forEach(node => {
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        node.vx += (dx / dist) * 0.0005;
        node.vy += (dy / dist) * 0.0005;
        nodes.forEach(other => {
          if (node === other) return;
          const ox = node.x - other.x;
          const oy = node.y - other.y;
          const d = Math.sqrt(ox * ox + oy * oy) || 1;
          const minDist = node.size + other.size + 6;
          if (d < minDist) {
            const overlap = (minDist - d) * 0.5;
            node.vx += (ox / d) * overlap;
            node.vy += (oy / d) * overlap;
          }
        });
        node.vx *= NODE_DAMPING;
        node.vy *= NODE_DAMPING;
        node.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, node.vx));
        node.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, node.vy));
        node.x += node.vx;
        node.y += node.vy;
        const margin = node.size + 6;
        if (node.x < margin) { node.x = margin; node.vx = 0; }
        if (node.x > width - margin) { node.x = width - margin; node.vx = 0; }
        if (node.y < margin) { node.y = margin; node.vy = 0; }
        if (node.y > height - margin) { node.y = height - margin; node.vy = 0; }
      });
      edges.forEach(edge => {
        const dx = edge.node2.x - edge.node1.x;
        const dy = edge.node2.y - edge.node1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = edge.node1.size + edge.node2.size + 70;
        const k = 0.002;
        const f = (dist - targetDist) * k;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        edge.node1.vx += fx;
        edge.node1.vy += fy;
        edge.node2.vx -= fx;
        edge.node2.vy -= fy;
      });
      edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.node1.x, edge.node1.y);
        ctx.lineTo(edge.node2.x, edge.node2.y);
        ctx.strokeStyle = `rgba(0,0,0,${Math.min(edge.strength * 0.18, 0.9)})`;
        ctx.lineWidth = Math.min(edge.strength * 0.6, 3);
        ctx.stroke();
      });
      nodes.forEach(node => {
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size + 8);
        gradient.addColorStop(0, 'rgba(200,200,200,0.6)');
        gradient.addColorStop(1, 'rgba(200,200,200,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = '#1e1a4d';
        ctx.fill();
        ctx.strokeStyle = '#f3e8ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#f3e8ff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.word, node.x, node.y);
      });
      ctx.restore();
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [nodes, edges, camera, isDragging, dragStart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width - 32;
      const maxWidth = Math.min(containerWidth, 800);
      const aspectRatio = 4 / 3;
      canvas.width = maxWidth;
      canvas.height = maxWidth / aspectRatio;
    };
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas.parentElement);
    updateCanvasSize();
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="lg:col-span-2 bg-indigo-900 rounded-lg shadow p-4 sm:p-6 border border-violet-400 order-2 lg:order-1">
      <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">Interactive Network Graph</h2>
      <div className="w-full">
        <canvas
          ref={canvasRef}
          className="w-full max-w-full h-auto rounded border-2 border-violet-400 cursor-move"
          style={{ aspectRatio: '4/3', maxHeight: '600px' }}
        />
      </div>
    </div>
  );
}

export default function ThoughtsData() {
  const [text, setText] = useState('');
  const [thoughts, setThoughts] = useState([]);
  const [loadingThoughts, setLoadingThoughts] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const MIN_FREQUENCY = 1;
  const WINDOW_SIZE = 2;
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const getWeekRange = (offset = 0) => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + offset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };
  const analysis = useMemo(() => {
    const closedClassWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is']);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const filteredWords = words.filter(w => !closedClassWords.has(w));
    const wordFrequencies = new Map();
    for (const word of filteredWords) {
      wordFrequencies.set(word, (wordFrequencies.get(word) || 0) + 1);
    }
    const coOccurrences = new Map();
    for (let i = 0; i < filteredWords.length; i++) {
      const currentWord = filteredWords[i];
      for (let j = 1; j <= WINDOW_SIZE && i + j < filteredWords.length; j++) {
        const neighborWord = filteredWords[i + j];
        const pair = [currentWord, neighborWord].sort().join('|||');
        coOccurrences.set(pair, (coOccurrences.get(pair) || 0) + 1);
      }
    }
    return {
      wordFrequencies,
      coOccurrences,
      totalWords: words.length,
      uniqueWords: wordFrequencies.size
    };
  }, [text]);

  useEffect(() => {
    const fetchThoughts = async () => {
      setLoadingThoughts(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.thoughts) ? json.thoughts : json;
          setThoughts(list);
        } else {
          console.warn('Failed to fetch thoughts, using fallback data');
          setThoughts(fallbackData.thoughts || []);
        }
      } catch (err) {
        console.warn('Fetch thoughts error, using fallback', err);
        setThoughts(fallbackData.thoughts || []);
      } finally {
        setLoadingThoughts(false);
      }
    };
    fetchThoughts();
  }, []);

  useEffect(() => {
    const { start, end } = getWeekRange(weekOffset);
    const weekThoughts = thoughts.filter(t => {
      const d = new Date(t.created_at || t.createdAt || t.createdAt);
      return d >= start && d <= end;
    });
    const merged = weekThoughts.map(t => t.text).join('. ');
    setText(merged || '');
  }, [thoughts, weekOffset]);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 12px sans-serif';
    const filteredWords = Array.from(analysis.wordFrequencies.entries())
      .filter(([_, count]) => count >= MIN_FREQUENCY)
      .map(([word]) => word);
    const newNodes = filteredWords.map((word, i) => {
      const textWidth = ctx.measureText(word).width;
      const minSize = (textWidth / 2) + 8;
      const frequencyBonus = (analysis.wordFrequencies.get(word) || 1) * 2;
      const circleSize = Math.max(minSize, 15 + frequencyBonus);
      return {
        word,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: circleSize
      };
    });
    const newEdges = [];
    for (const [pair, count] of analysis.coOccurrences.entries()) {
      const [word1, word2] = pair.split('|||');
      const node1 = newNodes.find(n => n.word === word1);
      const node2 = newNodes.find(n => n.word === word2);
      if (node1 && node2) {
        newEdges.push({ node1, node2, strength: count });
      }
    }
    setNodes(newNodes);
    setEdges(newEdges);
  }, [analysis]);

  const topPairs = useMemo(() => {
    return Array.from(analysis.coOccurrences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [analysis]);

  const handleDelete = async (thoughtId) => {
    if (!confirm('Are you sure you want to delete this thought?'))
      return;
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
    <div className="min-h-screen bg-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-indigo-900 rounded-lg shadow p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-violet-400">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Network className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-100 shrink-0" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-100">Thoughts Network Graph</h1>
            </div>
            <div className="w-full sm:w-auto">
              <WeekBar currentWeekOffset={weekOffset} setCurrentWeekOffset={setWeekOffset} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <CardNoIcon
              value={analysis.totalWords}
              label="Total Words"
            />
            <CardNoIcon
              value={analysis.uniqueWords}
              label="Unique Words"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <NetworkGraph nodes={nodes} edges={edges} />
          <TopConnections topPairs={topPairs} />
        </div>
        <AllThoughts
          thoughts={thoughts}
          editingId={editingId}
          editText={editText}
          setEditText={setEditText}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}
