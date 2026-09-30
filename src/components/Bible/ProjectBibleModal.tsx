import React from 'react';
import { BookOpen, ShieldCheck, Layers, Palette, Camera, Clapperboard, X, CheckCircle } from 'lucide-react';
import { useStoryStore } from '../../stores/storyStore';

interface ProjectBibleModalProps {
  onClose: () => void;
}

export const ProjectBibleModal: React.FC<ProjectBibleModalProps> = ({ onClose }) => {
  const { creativeBible, storyOutline, metadata } = useStoryStore();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/40 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e0fb73] text-slate-900 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Project Bible — {creativeBible?.title || metadata?.title || 'Visual Book'}</h2>
              <p className="text-xs text-slate-400 font-medium">Stateful Creative Direction & 6-Page Sequence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Creative Bible Section */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">1. Creative Bible & Visual Rules</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Locked</span>
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Format</span>
                <span className="font-semibold text-slate-800">{creativeBible?.format || 'Graphic Novel'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visual Style</span>
                <span className="font-semibold text-slate-800">{creativeBible?.visualStyle || metadata?.visualStyle}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tone & Mood</span>
                <span className="font-semibold text-slate-800">{creativeBible?.tone || 'Grounded, tense'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lighting</span>
                <span className="font-semibold text-slate-800">{creativeBible?.lighting || 'Overcast dawn'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Camera Language</span>
                <span className="font-semibold text-slate-800">{creativeBible?.cameraLanguage || 'Wide establishing + close-ups'}</span>
              </div>
            </div>
          </div>

          {/* 2. Story Outline Section */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">2. Page Structure & Story Sequence</h3>
            </div>

            <div className="space-y-2.5">
              {storyOutline.map((item) => (
                <div 
                  key={item.pageNumber}
                  className="bg-white p-3.5 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs hover:border-indigo-300 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                      P{item.pageNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-500 text-[11px]">{item.purpose}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.suggestedPanels} Panels
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Close Project Bible
          </button>
        </div>
      </div>
    </div>
  );
};
