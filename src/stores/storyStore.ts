import { create } from 'zustand';
import { StoryMetadata, StoryPanel, ChatMessage, VisualStyle } from '../types';

interface StoryState {
  metadata: StoryMetadata | null;
  panels: StoryPanel[];
  messages: ChatMessage[];
  currentPanelId: string | null;
  isLoading: boolean;
  
  // Actions
  setMetadata: (meta: StoryMetadata) => void;
  addPanel: (panel: StoryPanel) => void;
  updatePanel: (panelId: string, updates: Partial<StoryPanel>) => void;
  addMessage: (message: ChatMessage) => void;
  setCurrentPanel: (panelId: string | null) => void;
  setLoading: (loading: boolean) => void;
  initDemoStory: (preset: any) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  metadata: null,
  panels: [],
  messages: [],
  currentPanelId: null,
  isLoading: false,
  
  setMetadata: (meta) => set({ metadata: meta }),
  addPanel: (panel) => set((state) => ({ panels: [...state.panels, panel] })),
  updatePanel: (panelId, updates) => set((state) => ({
    panels: state.panels.map(p => p.id === panelId ? { ...p, ...updates } : p)
  })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setCurrentPanel: (panelId) => set({ currentPanelId: panelId }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  initDemoStory: (preset) => set({
    metadata: preset.metadata,
    panels: preset.panels,
    messages: preset.initialMessages || [],
    currentPanelId: preset.panels[0]?.id || null,
  }),
}));
