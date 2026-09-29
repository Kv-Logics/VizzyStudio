import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Volume2, 
  VolumeX, 
  Film,
  Share2,
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
      <header className="p-4 sticky top-0 z-40">
        <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/50">
          
          {/* LEFT: Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-slate-900 text-lg tracking-tight hidden sm:block">
              {metadata.title || "VizzyStudio"}
            </h1>
          </div>

          {/* CENTER: Settings / Nav Links */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-500">
            <select 
              value={metadata.visualStyle}
              onChange={(e) => onUpdateStyle(e.target.value as VisualStyle)}
              className="bg-transparent hover:text-slate-900 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="WW2 Sepia Ink">Style: WW2 Sepia</option>
              <option value="Gritty Noir">Style: Gritty Noir</option>
              <option value="Vibrant Anime">Style: Vibrant Anime</option>
              <option value="Cyberpunk Neon">Style: Cyberpunk Neon</option>
              <option value="Dark Fantasy Watercolors">Style: Dark Fantasy</option>
              <option value="Classic 1950s Comic Book">Style: 1950s Comic</option>
            </select>
            
            <select 
              onChange={(e) => onSwitchPreset(e.target.value)}
              value={metadata.id}
              className="bg-transparent hover:text-slate-900 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="123e4567-e89b-12d3-a456-426614174000">Preset: D-Day</option>
              <option value="123e4567-e89b-12d3-a456-426614174001">Preset: Neo-Tokyo</option>
              <option value="new-blank">Preset: Custom</option>
            </select>
            
            <button 
              onClick={() => { audioService.playSoundFx('click'); onOpenSetupWizard(); }} 
              className="hover:text-slate-900 transition-colors"
            >
              Setup
            </button>
            
            <button 
              onClick={() => { audioService.playSoundFx('click'); onExportPDF(); }} 
              className="hover:text-slate-900 transition-colors"
            >
              Export
            </button>
            
            <button 
              onClick={() => { audioService.playSoundFx('click'); setShowShareModal(true); }} 
              className="hover:text-slate-900 transition-colors"
            >
              Share
            </button>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { audioService.playSoundFx('click'); onToggleMute(); }} 
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => { audioService.playSoundFx('click'); onStartSlideshow(); }} 
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all mr-2" 
              title="Play Slideshow"
            >
              <Play className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => { audioService.playSoundFx('click'); onOpenNewPanel(); }}
              className="bg-[#dcfb5d] hover:bg-[#d0f04c] text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-full shadow-sm transition-transform active:scale-95 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Panel</span>
            </button>
          </div>

        </div>
      </header>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-slate-400" />
                <span>Share Graphic Novel</span>
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Share your interactive storyboard project with collaborators or publish the auto-running slideshow link.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition"
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
