import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MessageSquare, 
  Volume2, 
  Sliders, 
  Camera, 
  Palette, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { StoryPanel, PanelTextElement, CameraAngle, VisualStyle } from '../../types';
import { generateArtCanvasUrl } from '../../services/imageGeneratorService';
import { audioService } from '../../services/audioService';

interface PanelEditorModalProps {
  panel: StoryPanel;
  visualStyle: VisualStyle;
  onSave: (updatedPanel: StoryPanel) => void;
  onClose: () => void;
}

export const PanelEditorModal: React.FC<PanelEditorModalProps> = ({
  panel,
  visualStyle,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(panel.title);
  const [description, setDescription] = useState(panel.description);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>(panel.cameraAngle);
  const [filterEffect, setFilterEffect] = useState(panel.filterEffect || 'none');
  const [soundCue, setSoundCue] = useState(panel.soundEffectCue || 'boom');
  const [textElements, setTextElements] = useState<PanelTextElement[]>(panel.textElements || []);
  const [selectedOption, setSelectedOption] = useState(panel.selectedOption);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleAddTextElement = (type: 'speech' | 'thought' | 'caption' | 'soundfx') => {
    const newElem: PanelTextElement = {
      id: `elem-${Date.now()}`,
      type,
      content: type === 'speech' ? 'New Dialogue...' : type === 'caption' ? 'CAPTION HERE...' : 'BOOM!',
      speaker: type === 'speech' ? 'Character' : undefined,
      position: { x: 15, y: 15 + textElements.length * 15 }
    };
    setTextElements([...textElements, newElem]);
  };

  const handleUpdateText = (id: string, field: 'content' | 'speaker' | 'x' | 'y', val: any) => {
    setTextElements(textElements.map(elem => {
      if (elem.id !== id) return elem;
      if (field === 'x' || field === 'y') {
        return { ...elem, position: { ...elem.position, [field]: Number(val) } };
      }
      return { ...elem, [field]: val };
    }));
  };

  const handleRemoveText = (id: string) => {
    setTextElements(textElements.filter(e => e.id !== id));
  };

  const handleRegenerateImage = () => {
    setIsRegenerating(true);
    audioService.playSoundFx('synth_drone');

    setTimeout(() => {
      const newSeed = Math.floor(Math.random() * 99999);
      const newUrl = generateArtCanvasUrl(description || title, visualStyle, cameraAngle, newSeed);
      setSelectedOption({
        ...selectedOption,
        imageUrl: newUrl,
        seed: newSeed,
        cameraAngle: cameraAngle
      });
      setIsRegenerating(false);
    }, 500);
  };

  const handleSaveModal = () => {
    audioService.playSoundFx('page_turn');
    onSave({
      ...panel,
      title,
      description,
      cameraAngle,
      filterEffect: filterEffect as any,
      soundEffectCue: soundCue,
      textElements,
      selectedOption
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">
              Refine Panel {panel.panelNumber}: {title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Preview Pane */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-xl halftone-overlay">
              <img
                src={selectedOption.imageUrl}
                alt="Panel preview"
                className={`w-full h-full object-cover ${
                  filterEffect === 'sepia' ? 'sepia brightness-90' :
                  filterEffect === 'grayscale' ? 'grayscale contrast-125' :
                  filterEffect === 'vintage' ? 'sepia hue-rotate-15 contrast-110' :
                  filterEffect === 'neon' ? 'saturate-200 contrast-125' : ''
                }`}
              />

              {/* Rendered Text Bubbles inside modal preview */}
              {textElements.map((elem) => (
                <div
                  key={elem.id}
                  style={{ top: `${elem.position.y}%`, left: `${elem.position.x}%` }}
                  className={`absolute max-w-[80%] z-10 ${
                    elem.type === 'caption' ? 'caption-box text-[11px]' :
                    elem.type === 'soundfx' ? 'sound-fx text-lg' : 'speech-bubble text-[11px]'
                  }`}
                >
                  {elem.speaker && <span className="block text-[9px] uppercase text-indigo-950 font-bold">{elem.speaker}</span>}
                  {elem.content}
                </div>
              ))}
            </div>

            <button
              onClick={handleRegenerateImage}
              disabled={isRegenerating}
              className="w-full py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold text-xs border border-indigo-500/40 flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isRegenerating ? 'Rendering artwork...' : 'Re-render Panel Artwork'}</span>
            </button>

            {/* Filter Effects Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>Visual Filter Overlay:</span>
              </label>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {['none', 'sepia', 'grayscale', 'vintage', 'neon'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterEffect(f as any)}
                    className={`py-1.5 rounded-lg font-medium capitalize border transition ${
                      filterEffect === f
                        ? 'bg-amber-500/30 text-amber-300 border-amber-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Editing Pane */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Panel Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Scene Description:</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Camera Framing:</label>
              <select
                value={cameraAngle}
                onChange={(e) => setCameraAngle(e.target.value as CameraAngle)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-semibold focus:outline-none"
              >
                <option value="Cinematic Wide">Cinematic Wide</option>
                <option value="Dramatic Close-Up">Dramatic Close-Up</option>
                <option value="Over-The-Shoulder">Over-The-Shoulder</option>
                <option value="Low Angle Hero">Low Angle Hero</option>
                <option value="Bird's Eye View">Bird's Eye View</option>
              </select>
            </div>

            {/* Audio Sound Effect Cue */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1 flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Slideshow Sound Cue:</span>
              </label>
              <select
                value={soundCue}
                onChange={(e) => {
                  setSoundCue(e.target.value);
                  audioService.playSoundFx(e.target.value as any);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-semibold focus:outline-none"
              >
                <option value="boom">💥 WW2 Explosive Boom / Artillery</option>
                <option value="wave">🌊 Ocean Waves / Surge</option>
                <option value="trumpet">🎺 Heroic Brass Horns</option>
                <option value="synth_drone">⚡ Cyberpunk Synth Hum</option>
                <option value="page_turn">📄 Classic Comic Flip</option>
              </select>
            </div>

            {/* Text Elements / Speech Bubbles Section */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Speech & Text Elements ({textElements.length})</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleAddTextElement('speech')}
                    className="px-2 py-1 bg-indigo-600/30 text-indigo-300 rounded-lg hover:bg-indigo-600/50 border border-indigo-500/30 text-[10px]"
                  >
                    + Speech
                  </button>
                  <button
                    onClick={() => handleAddTextElement('caption')}
                    className="px-2 py-1 bg-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/50 border border-amber-500/30 text-[10px]"
                  >
                    + Caption
                  </button>
                  <button
                    onClick={() => handleAddTextElement('soundfx')}
                    className="px-2 py-1 bg-rose-500/30 text-rose-300 rounded-lg hover:bg-rose-500/50 border border-rose-500/30 text-[10px]"
                  >
                    + SFX
                  </button>
                </div>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {textElements.map((elem) => (
                  <div key={elem.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold capitalize text-amber-400 text-[10px]">{elem.type} bubble</span>
                      <button onClick={() => handleRemoveText(elem.id)} className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={elem.content}
                      onChange={(e) => handleUpdateText(elem.id, 'content', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 text-xs"
                      placeholder="Content text..."
                    />

                    {elem.type === 'speech' && (
                      <input
                        type="text"
                        value={elem.speaker || ''}
                        onChange={(e) => handleUpdateText(elem.id, 'speaker', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-400 text-[10px]"
                        placeholder="Speaker name..."
                      />
                    )}

                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                      <span>X Pos:</span>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={elem.position.x}
                        onChange={(e) => handleUpdateText(elem.id, 'x', e.target.value)}
                        className="w-20"
                      />
                      <span>Y Pos:</span>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={elem.position.y}
                        onChange={(e) => handleUpdateText(elem.id, 'y', e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveModal}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Panel Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
