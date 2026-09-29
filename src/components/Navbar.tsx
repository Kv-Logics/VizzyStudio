import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Plus, 
  Download, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Palette,
  Film,
  Share2,
  CloudCheck,
  Zap,
  HelpCircle,
  Wand2,
  X
} from 'lucide-react';
import { StoryMetadata, VisualStyle } from '../types';
import { audioService } from '../services/audioService';

interface NavbarProps {
  metadata: StoryMetadata;
  panelCount: number;
  onOpenNewPanel: () => void;
  onStartSlideshow: () => void;
  onExportPDF: () => void;
  onSwitchPreset: (presetId: string) => void;
  onUpdateStyle: (style: VisualStyle) => void;
  onOpenSetupWizard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  panelCount,
  onOpenNewPanel,
  onStartSlideshow,
  onExportPDF,
  onSwitchPreset,
  onUpdateStyle,
  onOpenSetupWizard,
  isMuted,
  onToggleMute
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-40 text-slate-100 shadow-2xl">
        {/* Left: Brand Logo & Cloud Status */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base text-white tracking-wide truncate max-w-xs md:max-w-md">
                {metadata.title}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {panelCount} {panelCount === 1 ? 'Panel' : 'Panels'}
              </span>
              <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Saved to Cloud</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-2">
              <span>Genre: <strong className="text-slate-200">{metadata.genre}</strong></span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">Vizzy Studio Pro</span>
            </p>
          </div>
        </div>

        {/* Center: Style Selector & Presets */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            <Palette className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-300 font-medium">Style:</span>
            <select 
              value={metadata.visualStyle}
              onChange={(e) => onUpdateStyle(e.target.value as VisualStyle)}
              className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="WW2 Sepia Ink" className="bg-slate-900 text-slate-100">🪖 WW2 Sepia Ink</option>
              <option value="Gritty Noir" className="bg-slate-900 text-slate-100">🕵️ Gritty Noir</option>
              <option value="Vibrant Anime" className="bg-slate-900 text-slate-100">🌸 Vibrant Anime</option>
              <option value="Cyberpunk Neon" className="bg-slate-900 text-slate-100">⚡ Cyberpunk Neon</option>
              <option value="Dark Fantasy Watercolors" className="bg-slate-900 text-slate-100">🐉 Dark Fantasy</option>
              <option value="Classic 1950s Comic Book" className="bg-slate-900 text-slate-100">💥 1950s Comic Book</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-slate-300 font-medium">Preset:</span>
            <select 
              onChange={(e) => onSwitchPreset(e.target.value)}
              value={metadata.id}
              className="bg-transparent text-xs text-sky-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="d-day-normandy" className="bg-slate-900 text-slate-100">🪖 D-Day Omaha Beach (WW2)</option>
              <option value="neo-tokyo-2099" className="bg-slate-900 text-slate-100">🏙️ Neo-Tokyo 2099 (Cyberpunk)</option>
              <option value="new-blank" className="bg-slate-900 text-slate-100">✨ Custom New Storyboard</option>
            </select>
          </div>

          {/* AI Credits Meter */}
          <div className="flex items-center space-x-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 text-xs text-amber-300 font-semibold" title="AI Generation Credits">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>1,450 / 2,000 Credits</span>
          </div>
        </div>

        {/* Right: SaaS Actions & Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              audioService.playSoundFx('click');
              onOpenSetupWizard();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold border border-purple-500/40 transition"
            title="Open Story Setup Wizard"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden xl:inline">Story Setup</span>
          </button>

          <button
            onClick={() => {
              audioService.playSoundFx('click');
              setShowShareModal(true);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            title="Share Graphic Novel"
          >
            <Share2 className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={() => {
              audioService.playSoundFx('click');
              onToggleMute();
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              audioService.playSoundFx('click');
              onOpenNewPanel();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95 border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Panel</span>
          </button>

          <button
            onClick={() => {
              audioService.playSoundFx('trumpet');
              onStartSlideshow();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-amber-500/20 transition active:scale-95 border border-amber-300/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Loop</span>
          </button>

          <button
            onClick={() => {
              audioService.playSoundFx('click');
              onExportPDF();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            title="Export Graphic Novel PDF"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span className="hidden md:inline">PDF</span>
          </button>
        </div>
      </header>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <span>Share Graphic Novel</span>
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Share your interactive storyboard project with collaborators or publish the auto-running slideshow link.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
              />
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
