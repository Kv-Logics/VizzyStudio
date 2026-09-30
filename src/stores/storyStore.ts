import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoryMetadata, StoryPanel, ChatMessage, WorkflowState, ActiveTarget, CreativeBible, PageOutlineItem } from '../types';

interface StoryState {
  metadata: StoryMetadata | null;
  panels: StoryPanel[];
  messages: ChatMessage[];
  currentPanelId: string | null;
  isLoading: boolean;
  workflowState: WorkflowState;
  activeTarget: ActiveTarget;
  creativeBible: CreativeBible | null;
  storyOutline: PageOutlineItem[];
  
  // Actions
  setMetadata: (meta: StoryMetadata) => void;
  setPanels: (panels: StoryPanel[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addPanel: (panel: StoryPanel) => void;
  updatePanel: (panelId: string, updates: Partial<StoryPanel>) => void;
  addMessage: (message: ChatMessage) => void;
  setCurrentPanel: (panelId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setWorkflowState: (state: WorkflowState) => void;
  setActiveTarget: (target: Partial<ActiveTarget>) => void;
  setCreativeBible: (bible: CreativeBible) => void;
  lockCreativeBible: () => void;
  setStoryOutline: (outline: PageOutlineItem[]) => void;
  initDemoStory: (preset: any) => void;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set) => ({
      metadata: null,
      panels: [],
      messages: [],
      currentPanelId: null,
      isLoading: false,
      workflowState: 'PAGE',
      activeTarget: { pageNumber: 1, panelNumber: 1, status: 'REFINING' },
      creativeBible: {
        title: 'D-Day: Dawn at Omaha Beach',
        format: 'Graphic Novel',
        genre: 'Historical World War II',
        tone: 'Grounded, tense, human',
        visualStyle: 'WW2 Sepia Ink',
        colorPalette: { primary: '#3f2d20', secondary: '#785f4c', accent: '#c25e38', background: '#f5efe6' },
        lighting: 'Overcast dawn, high contrast shadows',
        cameraLanguage: 'Wide establishing shots + intimate close-ups',
        artDirection: 'Hand-inked comic style, heavy crosshatching, sepia wash',
        negativeConstraints: 'No cartoon physics, no modern technology',
        isLocked: true
      },
      storyOutline: [
        { pageNumber: 1, title: 'Before Dawn', purpose: 'Landing craft interior tension', suggestedPanels: 3, status: 'in_progress' },
        { pageNumber: 2, title: 'The Ramp Drops', purpose: 'Chaos as landing begins', suggestedPanels: 3, status: 'pending' },
        { pageNumber: 3, title: 'Omaha Beach', purpose: 'Protagonist reaches the beach', suggestedPanels: 4, status: 'pending' },
        { pageNumber: 4, title: 'The Bunker', purpose: 'Squad seeks cover under fire', suggestedPanels: 3, status: 'pending' },
        { pageNumber: 5, title: 'Moving Inland', purpose: 'Squad advances past beach defenses', suggestedPanels: 3, status: 'pending' },
        { pageNumber: 6, title: 'Aftermath', purpose: 'Quiet closing reflection', suggestedPanels: 2, status: 'pending' },
      ],

      setMetadata: (meta) => set({ metadata: meta }),
      setPanels: (panels) => set({ panels }),
      setMessages: (messages) => set({ messages }),
      addPanel: (panel) => set((state) => ({ panels: [...state.panels, panel] })),
      updatePanel: (panelId, updates) => set((state) => ({
        panels: state.panels.map(p => p.id === panelId ? { ...p, ...updates } : p)
      })),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setCurrentPanel: (panelId) => set({ currentPanelId: panelId }),
      setLoading: (loading) => set({ isLoading: loading }),
      setWorkflowState: (workflowState) => set({ workflowState }),
      setActiveTarget: (target) => set((state) => ({ activeTarget: { ...state.activeTarget, ...target } })),
      setCreativeBible: (creativeBible) => set({ creativeBible }),
      lockCreativeBible: () => set((state) => ({
        creativeBible: state.creativeBible ? { ...state.creativeBible, isLocked: true } : null
      })),
      setStoryOutline: (storyOutline) => set({ storyOutline }),

      initDemoStory: (preset) => set({
        metadata: preset.metadata,
        panels: preset.panels,
        messages: preset.initialMessages || [],
        currentPanelId: preset.panels[0]?.id || null,
        workflowState: 'PAGE',
        activeTarget: { pageNumber: 1, panelNumber: preset.panels.length + 1, status: 'REFINING' },
      }),
    }),
    {
      name: 'vizzystudio-story-storage',
    }
  )
);


