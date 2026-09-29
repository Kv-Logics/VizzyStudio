import React, { useState } from 'react';
import { 
  Grid, 
  Layout, 
  Plus, 
  Edit3, 
  Trash2, 
  MoveLeft, 
  MoveRight, 
  Volume2, 
  Sparkles, 
  Eye,
  Sliders,
  Layers,
  Film
} from 'lucide-react';
import { StoryPanel, StoryMetadata } from '../../types';
import { audioService } from '../../services/audioService';

interface PanelGridProps {
  panels: StoryPanel[];
  metadata: StoryMetadata;
  onEditPanel: (panel: StoryPanel) => void;
  onDeletePanel: (panelId: string) => void;
  onMovePanel: (panelId: string, direction: 'left' | 'right') => void;
  onOpenNewPanel: () => void;
}

export const PanelGrid: React.FC<PanelGridProps> = ({
  panels,
  metadata,
  onEditPanel,
  onDeletePanel,
  onMovePanel,
  onOpenNewPanel
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'comic_page' | 'filmstrip'>('comic_page');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Top Studio Toolbar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                audioService.playSoundFx('click');
                setViewMode('comic_page');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'comic_page' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Comic Page</span>
            </button>

            <button
              onClick={() => {
                audioService.playSoundFx('click');
                setViewMode('grid');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Storyboard Grid</span>
            </button>

            <button
              onClick={() => {
                audioService.playSoundFx('click');
                setViewMode('filmstrip');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'filmstrip' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Film Strip</span>
            </button>
          </div>

          <span className="hidden md:inline text-xs text-slate-400">
            Style: <strong className="text-amber-400">{metadata.visualStyle}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              audioService.playSoundFx('click');
              onOpenNewPanel();
            }}
            className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Panel</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-radial from-slate-900 to-slate-950">
        {panels.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-3xl">
            <Sparkles className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200">No panels created yet</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
              Use Vizzy AI Chat on the left to generate your first panel, or click below to start writing!
            </p>
            <button
              onClick={onOpenNewPanel}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-amber-400 transition"
            >
              ➕ Create Panel 1
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'comic_page'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto bg-amber-100/5 p-6 rounded-3xl border border-amber-500/20 shadow-2xl backdrop-blur'
              : viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto'
              : 'flex space-x-6 overflow-x-auto pb-4 items-center'
          }>
            {panels.map((panel, index) => (
              <div
                key={panel.id}
                className={`group relative bg-slate-900 rounded-2xl border-2 overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-400/80 ${
                  viewMode === 'filmstrip' ? 'min-w-[340px] max-w-[360px] flex-shrink-0' : 'w-full'
                } border-slate-800`}
              >
                {/* Panel Header Bar */}
                <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center border border-amber-500/30">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-xs text-slate-200 truncate max-w-[140px]">
                      {panel.title || `Panel ${index + 1}`}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onMovePanel(panel.id, 'left')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30"
                      title="Move Panel Left/Up"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMovePanel(panel.id, 'right')}
                      disabled={index === panels.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30"
                      title="Move Panel Right/Down"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        audioService.playSoundFx('click');
                        onEditPanel(panel);
                      }}
                      className="p-1 text-indigo-400 hover:text-indigo-300"
                      title="Edit Speech & Visual Filters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePanel(panel.id)}
                      className="p-1 text-rose-400 hover:text-rose-300"
                      title="Delete Panel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Panel Image Container with Overlays */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden halftone-overlay group-hover:scale-[1.01] transition duration-300">
                  <img
                    src={panel.selectedOption?.imageUrl}
                    alt={panel.description}
                    className={`w-full h-full object-cover ${
                      panel.filterEffect === 'sepia' 
                        ? 'sepia brightness-90' 
                        : panel.filterEffect === 'grayscale' 
                        ? 'grayscale contrast-125' 
                        : panel.filterEffect === 'vintage' 
                        ? 'sepia hue-rotate-15 contrast-110' 
                        : panel.filterEffect === 'neon' 
                        ? 'saturate-200 contrast-125' 
                        : ''
                    }`}
                  />

                  {/* Camera Angle Tag */}
                  <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur text-[10px] px-2 py-0.5 rounded-md text-amber-300 font-bold border border-amber-500/30 shadow-md">
                    {panel.cameraAngle}
                  </div>

                  {/* Rendered Text Elements (Speech bubbles, captions, sound FX) */}
                  {panel.textElements.map((elem) => {
                    if (elem.type === 'caption') {
                      return (
                        <div
                          key={elem.id}
                          style={{ top: `${elem.position.y}%`, left: `${elem.position.x}%` }}
                          className="absolute max-w-[85%] caption-box text-[11px] uppercase tracking-wider font-vintage shadow-md z-10"
                        >
                          {elem.content}
                        </div>
                      );
                    } else if (elem.type === 'speech' || elem.type === 'thought') {
                      return (
                        <div
                          key={elem.id}
                          style={{ top: `${elem.position.y}%`, left: `${elem.position.x}%` }}
                          className="absolute max-w-[70%] speech-bubble text-[11px] font-bold z-10 leading-tight"
                        >
                          {elem.speaker && (
                            <span className="block text-[9px] uppercase tracking-wider text-indigo-900 border-b border-black/20 pb-0.5 mb-0.5">
                              {elem.speaker}
                            </span>
                          )}
                          {elem.content}
                        </div>
                      );
                    } else if (elem.type === 'soundfx') {
                      return (
                        <div
                          key={elem.id}
                          style={{ top: `${elem.position.y}%`, left: `${elem.position.x}%` }}
                          className="absolute sound-fx text-lg font-comic uppercase z-10 drop-shadow-md animate-pulse"
                        >
                          {elem.content}
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Play Audio Cue button */}
                  {panel.soundEffectCue && (
                    <button
                      onClick={() => audioService.playSoundFx(panel.soundEffectCue as any)}
                      className="absolute bottom-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition border border-amber-500/30"
                      title={`Play Sound Cue: ${panel.soundEffectCue}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Description Footer */}
                <div className="p-3 bg-slate-900/90 text-xs space-y-1">
                  <p className="text-slate-300 line-clamp-2">{panel.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
