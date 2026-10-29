import React, { useEffect, useState } from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';

const AudioVisualizer = ({ isListening = false, isSpeaking = false }) => {
  const [bars, setBars] = useState([18, 35, 60, 40, 75, 50, 85, 45, 90, 60, 75, 40, 55, 30, 70, 45, 30, 50, 20]);

  useEffect(() => {
    let interval;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setBars((prev) =>
          prev.map((_, idx) => {
            // Symmetrical frequency wave curve
            const centerWeight = 1 - Math.abs(idx - prev.length / 2) / (prev.length / 2);
            const base = isListening ? 40 : 25;
            const variance = Math.floor(Math.random() * (isListening ? 60 : 45));
            return Math.min(95, Math.max(12, Math.floor(base + variance * (0.6 + centerWeight * 0.4))));
          })
        );
      }, 80);
    } else {
      setBars([12, 16, 14, 20, 15, 18, 14, 22, 16, 18, 14, 20, 15, 18, 14, 16, 12, 14, 10]);
    }

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* State Status Tag */}
      <div className="flex items-center gap-2">
        {isListening && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Mic className="w-3.5 h-3.5" />
            <span>Listening to Your Voice...</span>
          </span>
        )}
        {isSpeaking && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30">
            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            <span>AI Avatar Speaking...</span>
          </span>
        )}
        {!isListening && !isSpeaking && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono border border-white/10">
            <Sparkles className="w-3 h-3 text-slate-500" />
            <span>Microphone Ready</span>
          </span>
        )}
      </div>

      {/* Dynamic Spectrum Waveform Bar */}
      <div className="w-full flex items-center justify-center gap-1.5 h-24 px-8 py-3 rounded-2xl bg-dark-900/80 border border-white/10 backdrop-blur-xl shadow-inner">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className={`w-1.5 sm:w-2 rounded-full transition-all duration-75 ${
              isListening
                ? 'bg-gradient-to-t from-rose-500 via-indigo-500 to-cyan-400 shadow-sm shadow-cyan-500/50'
                : isSpeaking
                ? 'bg-gradient-to-t from-purple-600 via-pink-500 to-amber-300 shadow-sm shadow-pink-500/50'
                : 'bg-slate-700/40'
            }`}
            style={{
              height: `${height}%`,
              minHeight: '6px',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioVisualizer;

