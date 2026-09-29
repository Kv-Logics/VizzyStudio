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
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">
      {/* Top Studio Toolbar */}
      <div className="p-4 bg-white/40 border-b border-white/50 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white/60 p-1 rounded-full border border-white/80 shadow-sm">
            <button
              onClick={() => {
                audioService.playSoundFx('click');
                setViewMode('comic_page');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                viewMode === 'comic_page' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Page</span>
            </button>

            <button
              onClick={() => {
                audioService.playSoundFx('click');
                setViewMode('grid');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => {
                audioService.playSoundFx('click');
                setViewMode('filmstrip');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                viewMode === 'filmstrip' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Film</span>
            </button>
          </div>

          <span className="hidden md:inline text-xs text-slate-500 font-medium ml-2">
            Style: <strong className="text-slate-900">{metadata.visualStyle}</strong>
          </span>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {panels.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/40 border border-white/50 rounded-3xl shadow-sm backdrop-blur-sm">
            <Sparkles className="w-12 h-12 text-[#d0f04c] mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900">Start your creative journey</h3>
            <p className="text-sm text-slate-600 max-w-md mt-2 mb-6">
              Use Vizzy AI Chat on the left to generate your first panel. Describe your scene and let the AI direct it.
            </p>
            <button
              onClick={onOpenNewPanel}
              className="px-6 py-3 rounded-full bg-[#e0fb73] text-slate-900 font-bold text-sm shadow-sm hover:bg-[#d0f04c] transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Panel 1</span>
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'comic_page'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto bg-white/30 p-8 rounded-[2rem] border border-white/50 shadow-sm backdrop-blur-md'
              : viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto'
              : 'flex space-x-8 overflow-x-auto pb-6 items-center px-4'
          }>
            {panels.map((panel, index) => (
              <div
                key={panel.id}
                className={`group relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  viewMode === 'filmstrip' ? 'min-w-[380px] max-w-[400px] flex-shrink-0' : 'w-full'
                }`}
              >
                {/* Panel Header Bar */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#e0fb73] text-slate-900 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-900 truncate max-w-[160px]">
                      {panel.title || `Panel ${index + 1}`}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onMovePanel(panel.id, 'left')}
                      disabled={index === 0}
                      className="p-1.5 bg-white rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 border border-slate-100 shadow-sm"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMovePanel(panel.id, 'right')}
                      disabled={index === panels.length - 1}
                      className="p-1.5 bg-white rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 border border-slate-100 shadow-sm"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        audioService.playSoundFx('click');
                        onEditPanel(panel);
                      }}
                      className="p-1.5 bg-white rounded-full text-blue-500 hover:bg-blue-50 border border-slate-100 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePanel(panel.id)}
                      className="p-1.5 bg-white rounded-full text-red-500 hover:bg-red-50 border border-slate-100 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Panel Image Container */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={panel.selectedOption?.imageUrl}
                    alt={panel.description}
                    className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${
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
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] px-2.5 py-1 rounded-md text-slate-900 font-bold shadow-sm">
                    {panel.cameraAngle}
                  </div>

                  {/* Rendered Text Elements */}
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
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 hover:bg-[#e0fb73] text-slate-900 shadow-md transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Description Footer */}
                <div className="p-4 bg-white text-xs space-y-1">
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{panel.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
