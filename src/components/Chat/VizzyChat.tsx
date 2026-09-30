import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2,
  Camera, 
  Wand2
} from 'lucide-react';
import { ChatMessage, PanelOption, VisualStyle, CameraAngle, StoryMetadata } from '../../types';
import { generatePanelOptions } from '../../services/imageGeneratorService';
import { audioService } from '../../services/audioService';
import { panelApi } from '../../services/apiClient';

import { useStoryStore } from '../../stores/storyStore';

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
  const { creativeBible, activeTarget, workflowState, lockCreativeBible } = useStoryStore();
  const [inputText, setInputText] = useState('');
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<PanelOption[] | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [customCaption, setCustomCaption] = useState('');
  const [customSpeech, setCustomSpeech] = useState('');
  const [activeCamera, setActiveCamera] = useState<CameraAngle>('Cinematic Wide');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generatedOptions]);

  const GENERATE_TRIGGERS = ['generate', 'gen panel', 'create panel', 'make panel', 'thats all generate', "that's all generate", 'generate panel', 'build panel', 'render'];

  const handleSend = () => {
    if (!inputText.trim()) return;
    audioService.playSoundFx('click');
    const text = inputText.trim();
    setInputText('');

    // Detect if user wants to generate a panel
    const lower = text.toLowerCase();
    const wantsGenerate = GENERATE_TRIGGERS.some(t => lower.includes(t));
    if (wantsGenerate) {
      onSendMessage(text);
      setTimeout(() => {
        handleGenerateOptions(text, activeCamera);
      }, 400);
      return;
    }

    onSendMessage(text);
  };

  const handleGenerateOptions = async (promptText: string, camera: CameraAngle) => {
    setIsGeneratingOptions(true);
    audioService.playSoundFx('synth_drone');
    
    if (metadata?.id && !metadata.id.startsWith('story-')) {
      try {
        const res = await panelApi.generatePanel(metadata.id, promptText);
        const taskId = res.data.task_id;
        const panelId = res.data.panel_id;

        const poll = setInterval(async () => {
          try {
            const statusRes = await panelApi.checkTaskStatus(taskId);
            if (statusRes.data.status === 'SUCCESS') {
              clearInterval(poll);
              const opts = await panelApi.getOptions(metadata.id, panelId);
              if (opts.data && opts.data.length > 0) {
                const mappedOptions = opts.data.map((o: any) => ({
                  id: o.id,
                  prompt: o.prompt,
                  description: o.prompt,
                  imageUrl: o.image_url,
                  cameraAngle: o.camera_angle,
                  lightingTone: 'Dramatic',
                  seed: o.seed
                }));
                setGeneratedOptions(mappedOptions);
                setSelectedOptionId(mappedOptions[0].id);
                setIsGeneratingOptions(false);
              }
            } else if (statusRes.data.status === 'FAILURE') {
                clearInterval(poll);
                setIsGeneratingOptions(false);
                alert("Task failed");
            }
          } catch(e) {}
        }, 2000);
        return;
      } catch (e) {
        console.warn('Backend unavailable, falling back to local mock generation.');
      }
    }
    
    setTimeout(() => {
      const options = generatePanelOptions(promptText, metadata.visualStyle, camera);
      setGeneratedOptions(options);
      setSelectedOptionId(options[0].id);
      setIsGeneratingOptions(false);
    }, 1500);
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
    <div className="flex flex-col h-full bg-white/40 backdrop-blur-md border-r border-white/50 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.1)] relative">
      {/* Vizzy Creative Director Header */}
      <div className="p-4 bg-white/70 border-b border-white/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#e0fb73] border-2 border-white shadow-sm flex items-center justify-center">
              <Bot className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-sm text-slate-900">Vizzy — Creative Director</h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Stateful AI Co-Director</p>
            </div>
          </div>

          <button
            onClick={() => handleGenerateOptions(inputText || `Panel ${panelCount + 1} scene`, activeCamera)}
            className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full bg-slate-900 text-white shadow-sm border border-slate-800 hover:bg-[#e0fb73] hover:text-slate-900 transition-all font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gen Panel</span>
          </button>
        </div>

        {/* Active Target & Pipeline Context Bar */}
        <div className="flex items-center justify-between text-[11px] bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
          <div className="flex items-center space-x-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Target: <strong>Page {activeTarget.pageNumber} → Panel {panelCount + 1}</strong></span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 font-semibold uppercase tracking-wider">
            {creativeBible?.isLocked ? '🔒 Bible Locked' : workflowState}
          </span>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.map((msg) => {
          const isVizzy = msg.sender === 'vizzy';
          return (
            <div
              key={msg.id}
              className={`flex space-x-3 ${isVizzy ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                isVizzy ? 'bg-[#e0fb73] text-slate-900' : 'bg-slate-900 text-white'
              }`}>
                {isVizzy ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] p-4 text-xs leading-relaxed shadow-sm ${
                isVizzy 
                  ? 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100' 
                  : 'bg-slate-900 text-white rounded-2xl rounded-tr-none'
              }`}>
                <div className="font-semibold text-[10px] opacity-75 mb-2 flex items-center justify-between">
                  <span>{isVizzy ? 'Vizzy' : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {renderFormattedText(msg.text)}
                </div>

                {/* Interactive Quick Replies in chat */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => {
                          audioService.playSoundFx('click');
                          const lower = reply.toLowerCase();
                          const wantsGenerate = GENERATE_TRIGGERS.some(t => lower.includes(t)) || lower.includes('add panel');
                          if (wantsGenerate) {
                            handleGenerateOptions(`Panel ${panelCount + 1} ${reply}`, activeCamera);
                          } else {
                            onSendMessage(reply);
                          }
                        }}
                        className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                          isVizzy 
                          ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-[#e0fb73] hover:border-[#e0fb73]' 
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
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
          <div className="flex space-x-3 items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <Bot className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-xs text-slate-600 font-medium">
              Rendering camera angle variations...
            </span>
          </div>
        )}

        {generatedOptions && generatedOptions.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs text-slate-900 tracking-wide uppercase">
                  Select Option for Panel {panelCount + 1}
                </h3>
              </div>
              <button
                onClick={() => setGeneratedOptions(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                ✕ Cancel
              </button>
            </div>

            {/* 3 Variations Grid */}
            <div className="grid grid-cols-1 gap-4">
              {generatedOptions.map((opt) => {
                const isSelected = opt.id === selectedOptionId;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      audioService.playSoundFx('click');
                      setSelectedOptionId(opt.id);
                    }}
                    className={`p-2.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#e0fb73] bg-[#f6ffdc]' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-200">
                      <img 
                        src={opt.imageUrl} 
                        alt={opt.description} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[10px] px-2 py-1 rounded text-slate-900 font-bold shadow-sm">
                        {opt.cameraAngle}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#e0fb73] text-slate-900 p-1 rounded-full shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{opt.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Custom Text Captions & Speech Inputs */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                  Panel Caption (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. OMAHA BEACH — 0700 HOURS"
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                  Dialogue (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hold the line!"
                  value={customSpeech}
                  onChange={(e) => setCustomSpeech(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Action Approve Button */}
            <button
              onClick={handleApproveSelectedOption}
              className="w-full py-3 rounded-xl bg-[#e0fb73] hover:bg-[#d0f04c] text-slate-900 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Add Panel</span>
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Controls & Quick Prompts Bar */}
      <div className="p-4 bg-white/60 border-t border-white/50 backdrop-blur-md space-y-3">
        {/* Camera Angle Selector Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-500 font-semibold flex items-center space-x-1 shrink-0">
            <Camera className="w-3 h-3" />
            <span>Angle:</span>
          </span>
          {(['Cinematic Wide', 'Dramatic Close-Up', 'Over-The-Shoulder', 'Low Angle Hero'] as CameraAngle[]).map((cam) => (
            <button
              key={cam}
              onClick={() => setActiveCamera(cam)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition shadow-sm border ${
                activeCamera === cam 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cam}
            </button>
          ))}
        </div>

        {/* Prompt Input Form */}
        <div className="flex items-center space-x-2 bg-white rounded-full border border-slate-200 p-1 shadow-sm">
          <input
            type="text"
            placeholder="Type your scene..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
