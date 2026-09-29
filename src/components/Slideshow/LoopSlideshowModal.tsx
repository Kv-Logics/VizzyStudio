import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  X, 
  Film, 
  Download,
  Sparkles,
  Clock
} from 'lucide-react';
import { StoryPanel, StoryMetadata } from '../../types';
import { audioService } from '../../services/audioService';

interface LoopSlideshowModalProps {
  panels: StoryPanel[];
  metadata: StoryMetadata;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const LoopSlideshowModal: React.FC<LoopSlideshowModalProps> = ({
  panels,
  metadata,
  onClose,
  isMuted,
  onToggleMute
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalTime, setIntervalTime] = useState(4); // seconds
  const [isLooping, setIsLooping] = useState(true);
  const [kenBurnsActive, setKenBurnsActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activePanel = panels[currentIndex];

  // Auto-advance slideshow loop logic
  useEffect(() => {
    if (!isPlaying || panels.length === 0) return;

    // Trigger audio cue when panel starts
    if (activePanel?.soundEffectCue && !isMuted) {
      audioService.playSoundFx(activePanel.soundEffectCue as any);
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= panels.length - 1) {
          if (isLooping) {
            return 0; // Seamless loop back to panel 1
          } else {
            setIsPlaying(false);
            return prevIndex;
          }
        }
        return prevIndex + 1;
      });
    }, intervalTime * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPlaying, intervalTime, isLooping, panels.length, isMuted, activePanel]);

  const handleNext = () => {
    audioService.playSoundFx('page_turn');
    setCurrentIndex((prev) => (prev + 1) % panels.length);
  };

  const handlePrev = () => {
    audioService.playSoundFx('page_turn');
    setCurrentIndex((prev) => (prev - 1 + panels.length) % panels.length);
  };

  if (panels.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-fadeIn">
      {/* Top Overlay Bar */}
      <div className="p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-20 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center font-comic">
            {currentIndex + 1}/{panels.length}
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">{metadata.title}</h2>
            <p className="text-[11px] text-amber-400 font-medium">Auto-running Graphic Novel Slideshow Loop</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setKenBurnsActive(!kenBurnsActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              kenBurnsActive 
                ? 'bg-amber-500/30 text-amber-300 border-amber-500/40' 
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            Ken Burns Pan: {kenBurnsActive ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Stage Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Active Panel Image with Ken Burns animation */}
        <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/30 halftone-overlay vignette-overlay">
          <img
            key={activePanel.id}
            src={activePanel.selectedOption?.imageUrl}
            alt={activePanel.description}
            className={`w-full h-full object-cover transition-transform duration-1000 ${
              kenBurnsActive ? 'animate-kenburns' : ''
            } ${
              activePanel.filterEffect === 'sepia' ? 'sepia brightness-90' :
              activePanel.filterEffect === 'grayscale' ? 'grayscale contrast-125' :
              activePanel.filterEffect === 'vintage' ? 'sepia hue-rotate-15 contrast-110' :
              activePanel.filterEffect === 'neon' ? 'saturate-200 contrast-125' : ''
            }`}
          />

          {/* Rendered Speech Bubbles and Captions */}
          {activePanel.textElements?.map((elem) => (
            <div
              key={elem.id}
              style={{ top: `${elem.position.y}%`, left: `${elem.position.x}%` }}
              className={`absolute max-w-[75%] z-20 transition-all duration-500 animate-fadeIn ${
                elem.type === 'caption' ? 'caption-box text-xs md:text-sm' :
                elem.type === 'soundfx' ? 'sound-fx text-2xl md:text-4xl' : 'speech-bubble text-xs md:text-sm'
              }`}
            >
              {elem.speaker && (
                <span className="block text-[10px] uppercase font-bold text-indigo-900 border-b border-black/20 pb-0.5 mb-0.5">
                  {elem.speaker}
                </span>
              )}
              {elem.content}
            </div>
          ))}

          {/* Panel Title Overlay Tag */}
          <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold text-amber-300 border border-amber-500/30">
            Panel {currentIndex + 1}: {activePanel.title}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar & Timeline Scrubber */}
      <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-20 space-y-3">
        {/* Progress Timeline Scrubber */}
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          {panels.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-1 h-2 rounded-full cursor-pointer transition-all ${
                idx === currentIndex
                  ? 'bg-amber-400 shadow-md shadow-amber-400/50 scale-y-125'
                  : idx < currentIndex
                  ? 'bg-slate-600'
                  : 'bg-slate-800'
              }`}
              title={`Jump to Panel ${idx + 1}`}
            />
          ))}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between max-w-4xl mx-auto text-white">
          <div className="flex items-center space-x-2 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Duration:</span>
            <select
              value={intervalTime}
              onChange={(e) => setIntervalTime(Number(e.target.value))}
              className="bg-slate-900 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
            >
              <option value={2}>2s (Fast Pace)</option>
              <option value={4}>4s (Standard Story)</option>
              <option value={6}>6s (Dramatic Cinematic)</option>
              <option value={8}>8s (Slow Reading)</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
              title="Previous Panel"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 transition active:scale-95"
              title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
              title="Next Panel"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition ${
                isLooping 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isLooping ? 'Loop ON' : 'Loop OFF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
