import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2, 
  RefreshCw, 
  Camera, 
  Sliders, 
  Wand2, 
  Image as ImageIcon,
  MessageSquarePlus,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, PanelOption, VisualStyle, CameraAngle, StoryMetadata } from '../../types';
import { generatePanelOptions } from '../../services/imageGeneratorService';
import { audioService } from '../../services/audioService';

interface VizzyChatProps {
  metadata: StoryMetadata;
  messages: ChatMessage[];
  onSendMessage: (msgText: string) => void;
  onSelectOptionForNewPanel: (option: PanelOption, caption?: string, speech?: string) => void;
  onUpdateStyle: (style: VisualStyle) => void;
  panelCount: number;
}

export const VizzyChat: React.FC<VizzyChatProps> = ({
  metadata,
  messages,
  onSendMessage,
  onSelectOptionForNewPanel,
  onUpdateStyle,
  panelCount
}) => {
  const [inputText, setInputText] = useState('');
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<PanelOption[] | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [customCaption, setCustomCaption] = useState('');
  const [customSpeech, setCustomSpeech] = useState('');
  const [activeCamera, setActiveCamera] = useState<CameraAngle>('Cinematic Wide');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generatedOptions]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    audioService.playSoundFx('click');
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleGenerateOptions = (promptText: string, camera: CameraAngle) => {
    setIsGeneratingOptions(true);
    audioService.playSoundFx('synth_drone');
    
    setTimeout(() => {
      const options = generatePanelOptions(promptText, metadata.visualStyle, camera);
      setGeneratedOptions(options);
      setSelectedOptionId(options[0].id);
      setIsGeneratingOptions(false);
    }, 600);
  };

  const handleApproveSelectedOption = () => {
    if (!generatedOptions || !selectedOptionId) return;
    const chosen = generatedOptions.find(o => o.id === selectedOptionId);
    if (!chosen) return;

    audioService.playSoundFx('page_turn');
    onSelectOptionForNewPanel(chosen, customCaption, customSpeech);
    setGeneratedOptions(null);
    setSelectedOptionId(null);
    setCustomCaption('');
    setCustomSpeech('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-r border-slate-800 shadow-2xl relative">
      {/* Vizzy Assistant Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm text-slate-100">Vizzy AI Creative Assistant</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Iterative visual book & panel direction companion</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleGenerateOptions(`Panel ${panelCount + 1} action scene`, activeCamera)}
            className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-medium transition"
            title="Generate panel options for next scene"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gen Panel</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isVizzy = msg.sender === 'vizzy';
          return (
            <div
              key={msg.id}
              className={`flex space-x-3 ${isVizzy ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                isVizzy ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-600 text-white'
              }`}>
                {isVizzy ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                isVizzy 
                  ? 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none' 
                  : 'bg-indigo-600 text-white rounded-tr-none'
              }`}>
                <div className="font-semibold text-[10px] opacity-75 mb-1 flex items-center justify-between">
                  <span>{isVizzy ? 'Vizzy' : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Interactive Quick Replies in chat */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5">
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => {
                          audioService.playSoundFx('click');
                          if (reply.startsWith('Add Panel')) {
                            handleGenerateOptions(reply, 'Cinematic Wide');
                          } else {
                            onSendMessage(reply);
                          }
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-700/80 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-600 transition duration-150"
                      >
                        ⚡ {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Panel Options Generation Card inside Chat */}
        {isGeneratingOptions && (
          <div className="flex space-x-3 items-center p-3 bg-slate-800/60 rounded-xl border border-slate-700 animate-pulse">
            <Bot className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-xs text-amber-300 font-medium">
              Vizzy is rendering 3 camera angle variations for Panel {panelCount + 1}...
            </span>
          </div>
        )}

        {generatedOptions && generatedOptions.length > 0 && (
          <div className="bg-slate-950/90 rounded-2xl p-4 border-2 border-amber-500/40 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs text-amber-300 tracking-wide uppercase">
                  Select Visual Option for Panel {panelCount + 1}
                </h3>
              </div>
              <button
                onClick={() => setGeneratedOptions(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ✕ Cancel
              </button>
            </div>

            {/* 3 Variations Grid */}
            <div className="grid grid-cols-1 gap-3">
              {generatedOptions.map((opt) => {
                const isSelected = opt.id === selectedOptionId;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      audioService.playSoundFx('click');
                      setSelectedOptionId(opt.id);
                    }}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10' 
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-slate-950">
                      <img 
                        src={opt.imageUrl} 
                        alt={opt.description} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur text-[10px] px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-500/30">
                        {opt.cameraAngle}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{opt.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{opt.lightingTone}</span>
                  </div>
                );
              })}
            </div>

            {/* Custom Text Captions & Speech Inputs */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Panel Text Caption (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. OMAHA BEACH — 0700 HOURS. BREACH IN PROGRESS."
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Character Speech Dialogue (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Captain Miller: 'Hold the line! Move to the crater!'"
                  value={customSpeech}
                  onChange={(e) => setCustomSpeech(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Action Approve Button */}
            <button
              onClick={handleApproveSelectedOption}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Add Panel {panelCount + 1} to Graphic Novel</span>
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Controls & Quick Prompts Bar */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
        {/* Camera Angle Selector Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-400 font-medium flex items-center space-x-1 shrink-0">
            <Camera className="w-3 h-3 text-slate-400" />
            <span>Camera:</span>
          </span>
          {(['Cinematic Wide', 'Dramatic Close-Up', 'Over-The-Shoulder', 'Low Angle Hero'] as CameraAngle[]).map((cam) => (
            <button
              key={cam}
              onClick={() => setActiveCamera(cam)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 transition ${
                activeCamera === cam 
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cam}
            </button>
          ))}
        </div>

        {/* Prompt Input Form */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Describe panel scene or ask Vizzy for advice..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner"
          />
          
          <button
            onClick={() => handleGenerateOptions(inputText || `Panel ${panelCount + 1} scene`, activeCamera)}
            className="p-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition"
            title="Generate Visual Options from Prompt"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={handleSend}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition active:scale-95"
            title="Send chat message to Vizzy"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
