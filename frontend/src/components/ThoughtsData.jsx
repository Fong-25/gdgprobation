import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Network, FileText, GitBranch } from 'lucide-react';
import ThoughtsForm from './ThoughtsForm';
import { data as fallbackData } from '../data';

const ThoughtsData = () => {
  // text is derived from database thoughts for a selected week
  const [text, setText] = useState('');
  const [thoughts, setThoughts] = useState([]);
  const [loadingThoughts, setLoadingThoughts] = useState(true);
  // week offset: 0 = current week, -1 = previous week, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  // fixed analysis parameters (controls removed)
  const MIN_FREQUENCY = 1;
  const WINDOW_SIZE = 2;
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // clamp camera panning so user can't move the graph infinitely far
  const clampCamera = (cam, width, height) => {
    const MAX_PAN = Math.max(width, height) * 0.6; // how far from center you can pan
    const clampedX = Math.max(-MAX_PAN, Math.min(MAX_PAN, cam.x));
    const clampedY = Math.max(-MAX_PAN, Math.min(MAX_PAN, cam.y));
    const clampedZoom = Math.max(0.4, Math.min(3, cam.zoom));
    return { x: clampedX, y: clampedY, zoom: clampedZoom };
  };

  const analysis = useMemo(() => {
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is']);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const filteredWords = words.filter(w => !stopwords.has(w));

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

  // compute start/end of week (Monday start) for a given offset
  const getWeekRange = (offset = 0) => {
    const now = new Date();
    // Start from today, go to Monday
    const day = (now.getDay() + 6) % 7; // 0=Mon .. 6=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + offset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };

  // fetch thoughts from backend and fallback to local data if fetch fails
  useEffect(() => {
    const fetchThoughts = async () => {
      setLoadingThoughts(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thoughts`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          // controller returns { thoughts }
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

  // recompute text when thoughts or weekOffset change
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Create nodes from words with sufficient frequency
    const filteredWords = Array.from(analysis.wordFrequencies.entries())
      .filter(([_, count]) => count >= MIN_FREQUENCY)
      .map(([word]) => word);

    // Calculate text width for each word to size circles appropriately
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = 'bold 12px sans-serif';

    // Position nodes in a circular layout with some randomness
    const newNodes = filteredWords.map((word, i) => {
      const angle = (i / filteredWords.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.35;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Measure text width and calculate appropriate circle size
      const textWidth = tempCtx.measureText(word).width;
      const minSize = (textWidth / 2) + 8; // Half text width plus padding
      const frequencyBonus = (analysis.wordFrequencies.get(word) || 1) * 2;
      const circleSize = Math.max(minSize, 15 + frequencyBonus);
      
      return {
        word,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 18,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 18,
        // no initial angular velocity so graph remains stable
        vx: 0,
        vy: 0,
        size: circleSize
      };
    });

    // Create edges from co-occurrences
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

  useEffect(() => {
    if (nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Handle wheel zoom
    const handleWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.4, Math.min(3, camera.zoom * zoomFactor));

      // Zoom towards mouse position
      const worldX = (mouseX - width / 2 - camera.x) / camera.zoom;
      const worldY = (mouseY - height / 2 - camera.y) / camera.zoom;

      setCamera(prev => clampCamera({
        x: prev.x - worldX * (newZoom - prev.zoom),
        y: prev.y - worldY * (newZoom - prev.zoom),
        zoom: newZoom
      }, width, height));
    };

    // Handle mouse drag
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
  // Clear canvas with white background (monochrome theme)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

      // Save context and apply camera transform
      ctx.save();
      ctx.translate(width / 2 + camera.x, height / 2 + camera.y);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-width / 2, -height / 2);

      // Apply simplified forces so graph stays still (settles quickly)
      const NODE_DAMPING = 0.82;
      const MAX_SPEED = 2;
      nodes.forEach(node => {
        // very small centering force to avoid slow drift
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        node.vx += (dx / dist) * 0.0005;
        node.vy += (dy / dist) * 0.0005;

        // Lightweight overlap avoidance
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

        // Edge springs (weaker) - keep nodes anchored relative to edges
        // We'll apply a reduced spring force below per-edge

        // Apply damping and cap speed
        node.vx *= NODE_DAMPING;
        node.vy *= NODE_DAMPING;
        node.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, node.vx));
        node.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, node.vy));

        node.x += node.vx;
        node.y += node.vy;

        // Clamp nodes inside canvas
        const margin = node.size + 6;
        if (node.x < margin) { node.x = margin; node.vx = 0; }
        if (node.x > width - margin) { node.x = width - margin; node.vx = 0; }
        if (node.y < margin) { node.y = margin; node.vy = 0; }
        if (node.y > height - margin) { node.y = height - margin; node.vy = 0; }
      });

      // Spring force for connected nodes
      // Spring force for connected nodes (reduced strength)
      edges.forEach(edge => {
        const dx = edge.node2.x - edge.node1.x;
        const dy = edge.node2.y - edge.node1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = edge.node1.size + edge.node2.size + 70;
        const k = 0.002; // weaker spring constant
        const f = (dist - targetDist) * k;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        edge.node1.vx += fx;
        edge.node1.vy += fy;
        edge.node2.vx -= fx;
        edge.node2.vy -= fy;
      });

      // Draw edges (monochrome)
      edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.node1.x, edge.node1.y);
        ctx.lineTo(edge.node2.x, edge.node2.y);
        ctx.strokeStyle = `rgba(0,0,0,${Math.min(edge.strength * 0.18, 0.9)})`;
        ctx.lineWidth = Math.min(edge.strength * 0.6, 3);
        ctx.stroke();
      });

      // Draw nodes (monochrome)
      nodes.forEach(node => {
        // Outer subtle glow (light gray)
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size + 8);
        gradient.addColorStop(0, 'rgba(200,200,200,0.6)');
        gradient.addColorStop(1, 'rgba(200,200,200,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 8, 0, Math.PI * 2);
        ctx.fill();

        // Node circle (dark for contrast)
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = '#0b0b0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Word label - white on dark node for contrast
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.word, node.x, node.y);
      });

      ctx.restore();

  // Draw zoom indicator (monochrome)
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`Zoom: ${(camera.zoom * 100).toFixed(0)}%`, 20, 30);

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

  const topPairs = useMemo(() => {
    return Array.from(analysis.coOccurrences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [analysis]);

  // whether user already added a thought today (based on fetched thoughts)
  const hasThoughtToday = useMemo(() => {
    const today = new Date();
    return thoughts.some(t => {
      const d = new Date(t.created_at || t.createdAt || t.createdAt);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    });
  }, [thoughts]);

  // allow adding only when viewing current week and user hasn't already added today
  const canAddToday = weekOffset === 0 && !hasThoughtToday;

  const handleAddedThought = (newThought) => {
    if (!newThought) return;
    // prepend the new thought so most recent appear first
    setThoughts(prev => [newThought, ...prev]);
    // ensure viewing current week so the new thought is visible
    setWeekOffset(0);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 mb-6 border border-black">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-black" />
              <h1 className="text-3xl font-bold text-black">Word Network Graph</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(w => w - 1)}
                className="px-3 py-1 border border-black bg-white text-black rounded"
                aria-label="Previous week"
              >
                ← Week
              </button>
              <div className="text-sm text-black px-3">
                {(() => {
                  const { start, end } = getWeekRange(weekOffset);
                  return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
                })()}
              </div>
              <button
                onClick={() => setWeekOffset(w => Math.min(0, w + 1))}
                className="px-3 py-1 border border-black bg-white text-black rounded"
                aria-label="Next week"
              >
                Week →
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700">Graph is generated from the thoughts stored in the database for the selected week.</p>
            {loadingThoughts && <p className="text-sm text-gray-500 mt-2">Loading thoughts…</p>}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg border border-black bg-gray-50">
              <div className="text-2xl font-bold text-black">{analysis.totalWords}</div>
              <div className="text-sm text-gray-700">Total Words</div>
            </div>
            <div className="p-4 rounded-lg border border-black bg-gray-50">
              <div className="text-2xl font-bold text-black">{analysis.uniqueWords}</div>
              <div className="text-sm text-gray-700">Unique Words</div>
            </div>
            <div className="p-4 rounded-lg border border-black bg-gray-50">
              <div className="text-2xl font-bold text-black">{nodes.length}</div>
              <div className="text-sm text-gray-700">Nodes in Graph</div>
            </div>
          </div>
          <ThoughtsForm canAddToday={canAddToday} onAdded={handleAddedThought} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-lg shadow p-6 border border-black">
            <h2 className="text-xl font-bold text-black mb-4">Interactive Network Graph</h2>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full rounded border-2 border-black cursor-move"
            />
            <p className="text-sm text-gray-700 mt-2 text-center">
              Scroll to zoom • Click and drag to pan • Words are connected based on proximity
            </p>
          </div>

      {/* Top Connections Panel */}
          <div className="bg-white rounded-lg shadow p-6 border border-black">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-black" />
              <h2 className="text-xl font-bold text-black">Top Connections</h2>
            </div>


            <div className="space-y-2 max-h-[550px] overflow-y-auto" >
              {topPairs.map(([pair, count], idx) => {
                const [word1, word2] = pair.split('|||');
                return (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-black">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-black">{word1}</span>
                      <span className="text-xs text-gray-700">↔</span>
                      <span className="text-sm font-medium text-black">{word2}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-1 bg-black text-white rounded-full text-xs font-semibold">
                        {count}x
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ThoughtsData;