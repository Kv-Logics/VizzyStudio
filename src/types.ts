export type CameraAngle = 
  | 'Cinematic Wide'
  | 'Dramatic Close-Up'
  | 'Over-The-Shoulder'
  | 'Low Angle Hero'
  | 'Bird\'s Eye View'
  | 'Dutch Angle Tilted';

export type VisualStyle = 
  | 'WW2 Sepia Ink'
  | 'Gritty Noir'
  | 'Vibrant Anime'
  | 'Cyberpunk Neon'
  | 'Dark Fantasy Watercolors'
  | 'Classic 1950s Comic Book';

export interface PanelTextElement {
  id: string;
  type: 'speech' | 'thought' | 'caption' | 'soundfx';
  content: string;
  speaker?: string;
  position: { x: number; y: number }; // percentage 0-100
}

export interface PanelOption {
  id: string;
  imageUrl: string;
  seed: number;
  prompt: string;
  cameraAngle: CameraAngle;
  lightingTone: string;
  description: string;
}

export type WorkflowState = 
  | 'DISCOVER'
  | 'BRIEF'
  | 'OUTLINE'
  | 'PAGE'
  | 'GENERATE'
  | 'SELECT'
  | 'REFINE'
  | 'APPROVED';

export type PanelLifecycleStatus = 
  | 'DRAFT'
  | 'DESCRIBING'
  | 'GENERATING'
  | 'OPTIONS_READY'
  | 'SELECTED'
  | 'REFINING'
  | 'APPROVED';

export interface CreativeBible {
  title: string;
  format: string;
  genre: string;
  tone: string;
  visualStyle: VisualStyle;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  lighting: string;
  cameraLanguage: string;
  artDirection: string;
  negativeConstraints: string;
  isLocked: boolean;
}

export interface PageOutlineItem {
  pageNumber: number;
  title: string;
  purpose: string;
  suggestedPanels: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ActiveTarget {
  pageNumber: number;
  panelNumber: number;
  panelId?: string;
  version?: string;
  status: PanelLifecycleStatus;
}

export interface StoryPanel {
  id: string;
  pageNumber: number;
  panelNumber: number;
  title: string;
  description: string;
  cameraAngle: CameraAngle;
  selectedOption: PanelOption;
  availableOptions: PanelOption[];
  textElements: PanelTextElement[];
  filterEffect?: 'sepia' | 'grayscale' | 'contrast' | 'vintage' | 'neon' | 'none';
  borderStyle?: 'solid' | 'handdrawn' | 'borderless' | 'jagged';
  durationSeconds?: number;
  soundEffectCue?: string;
  status?: PanelLifecycleStatus;
}

export interface StoryMetadata {
  id: string;
  title: string;
  genre: string;
  visualStyle: VisualStyle;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  synopsis: string;
  characterNotes: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '2:3';
  author: string;
  creativeBible?: CreativeBible;
  storyOutline?: PageOutlineItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'vizzy' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'style_selection' | 'option_picker' | 'panel_approval' | 'system_tip';
  optionsToPick?: PanelOption[];
  relatedPanelId?: string;
  quickReplies?: string[];
  intentAction?: string;
}

