import React, { useState } from 'react';
import { 
  X, 
  Wand2, 
  Palette, 
  BookOpen, 
  User, 
  Check, 
  Sparkles,
  Camera,
  Film
} from 'lucide-react';
import { StoryMetadata, VisualStyle } from '../../types';
import { audioService } from '../../services/audioService';

interface StorySetupWizardModalProps {
  metadata: StoryMetadata;
  onSaveMetadata: (newMeta: StoryMetadata) => void;
  onClose: () => void;
}

const STYLES_INFO: Array<{ name: VisualStyle; desc: string; icon: string; colors: string[] }> = [
  {
    name: 'WW2 Sepia Ink',
    desc: 'Classic vintage newsprint sepia tone with heavy ink cross-hatching shading.',
    icon: '🪖',
    colors: ['#1c1917', '#78350f', '#dc2626', '#fef3c7']
  },
  {
    name: 'Gritty Noir',
    desc: 'High contrast black & white chiaroscuro shadows with stark crimson accent pops.',
    icon: '🕵️',
    colors: ['#09090b', '#27272a', '#e11d48', '#e4e4e7']
  },
  {
    name: 'Cyberpunk Neon',
    desc: 'Electric cyan & magenta neon flares against rain-soaked metallic skyscrapers.',
    icon: '⚡',
    colors: ['#030712', '#1e1b4b', '#d946ef', '#06b6d4']
  },
  {
    name: 'Vibrant Anime',
    desc: 'Vivid color saturation, heroic line-art vectors and dramatic sky gradients.',
    icon: '🌸',
    colors: ['#0f172a', '#4338ca', '#ec4899', '#fef08a']
  },
  {
    name: 'Dark Fantasy Watercolors',
    desc: 'Ethereal emerald forest shadows with golden glowing magical rune highlights.',
    icon: '🐉',
    colors: ['#022c22', '#065f46', '#facc15', '#052e16']
  },
  {
    name: 'Classic 1950s Comic Book',
    desc: 'Pop-art primary colors, halftone dot textures and dynamic action line-art.',
    icon: '💥',
    colors: ['#1e3a8a', '#dc2626', '#facc15', '#ffffff']
  }
];

export const StorySetupWizardModal: React.FC<StorySetupWizardModalProps> = ({
  metadata,
  onSaveMetadata,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState(metadata.title);
  const [genre, setGenre] = useState(metadata.genre);
  const [synopsis, setSynopsis] = useState(metadata.synopsis);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(metadata.visualStyle);
  const [characterNotes, setCharacterNotes] = useState(metadata.characterNotes);
  const [author, setAuthor] = useState(metadata.author || 'User');

  const handleFinish = () => {
    audioService.playSoundFx('page_turn');
    const selectedStyleObj = STYLES_INFO.find(s => s.name === visualStyle) || STYLES_INFO[0];
    onSaveMetadata({
      ...metadata,
      title,
      genre,
      synopsis,
      visualStyle,
      colorPalette: {
        primary: selectedStyleObj.colors[0],
        secondary: selectedStyleObj.colors[1],
        accent: selectedStyleObj.colors[2],
        background: selectedStyleObj.colors[3]
      },
      characterNotes,
      author
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">
                Vizzy Project Setup Wizard — Step {step} of 3
              </h3>
              <p className="text-xs text-slate-400">Configure visual style, story notes, and tone</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 text-xs">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition ${
              step === 1 ? 'border-amber-400 text-amber-300 bg-amber-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            1. Concept & Notes
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition ${
              step === 2 ? 'border-amber-400 text-amber-300 bg-amber-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            2. Visual Aesthetic
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition ${
              step === 3 ? 'border-amber-400 text-amber-300 bg-amber-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            3. Character Roster
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-bold text-slate-200 block mb-1">Graphic Novel Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-amber-400 text-sm"
                  placeholder="e.g. D-Day: Dawn at Omaha Beach"
                />
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1">Story Genre:</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-amber-300 font-bold focus:outline-none"
                >
                  <option value="Historical War Drama">🪖 Historical War Drama</option>
                  <option value="Sci-Fi Cyberpunk">⚡ Sci-Fi Cyberpunk Heist</option>
                  <option value="Dark Fantasy Quest">🐉 Dark Fantasy Quest</option>
                  <option value="Gritty Detective Noir">🕵️ Gritty Detective Noir</option>
                  <option value="Indie Film Storyboard">🎬 Indie Film Storyboard</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1">High-Level Pitch / Script Outline:</label>
                <textarea
                  rows={4}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed"
                  placeholder="Provide story script notes, key events, or film beat sequence..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <label className="font-bold text-slate-200 block mb-1">Select Visual Art Style Preset:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STYLES_INFO.map((styleObj) => {
                  const isSelected = visualStyle === styleObj.name;
                  return (
                    <div
                      key={styleObj.name}
                      onClick={() => {
                        audioService.playSoundFx('click');
                        setVisualStyle(styleObj.name);
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{styleObj.icon}</span>
                          <h4 className="font-bold text-slate-100">{styleObj.name}</h4>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">{styleObj.desc}</p>
                      
                      {/* Color Palette preview chips */}
                      <div className="flex items-center space-x-1">
                        {styleObj.colors.map((c, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-bold text-slate-200 block mb-1">Character Roster & Key Notes:</label>
                <textarea
                  rows={4}
                  value={characterNotes}
                  onChange={(e) => setCharacterNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed"
                  placeholder="e.g. Captain Miller (Leader), Private Jackson (Sniper), Sergeant Sullivan (Tactician)"
                />
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1">Author Credit:</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1) as any)}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold disabled:opacity-30"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(prev => Math.min(3, prev + 1) as any)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold shadow-lg flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Launch Storyboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
