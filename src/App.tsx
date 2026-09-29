import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { VizzyChat } from './components/Chat/VizzyChat';
import { PanelGrid } from './components/Storyboard/PanelGrid';
import { PanelEditorModal } from './components/Storyboard/PanelEditorModal';
import { LoopSlideshowModal } from './components/Slideshow/LoopSlideshowModal';
import { StorySetupWizardModal } from './components/Wizard/StorySetupWizardModal';
import { D_DAY_STORY, CYBERPUNK_STORY } from './data/presetStories';
import { StoryMetadata, StoryPanel, ChatMessage, PanelOption, VisualStyle } from './types';
import { generateArtCanvasUrl, generatePanelOptions } from './services/imageGeneratorService';
import { exportStoryToPDF } from './services/pdfExportService';
import { audioService } from './services/audioService';

export function App() {
  // Active Story State
  const [metadata, setMetadata] = useState<StoryMetadata>(D_DAY_STORY.metadata);
  const [panels, setPanels] = useState<StoryPanel[]>(D_DAY_STORY.panels);
  const [messages, setMessages] = useState<ChatMessage[]>(
    D_DAY_STORY.initialMessages.map((msg, idx) => ({
      id: `msg-init-${idx}`,
      sender: msg.sender,
      text: msg.text,
      timestamp: 'Just now',
      quickReplies: msg.quickReplies
    }))
  );

  // Modal & Audio States
  const [editingPanel, setEditingPanel] = useState<StoryPanel | null>(null);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Switch Story Presets
  const handleSwitchPreset = (presetId: string) => {
    audioService.playSoundFx('page_turn');
    if (presetId === 'd-day-normandy') {
      setMetadata(D_DAY_STORY.metadata);
      setPanels(D_DAY_STORY.panels);
      setMessages(
        D_DAY_STORY.initialMessages.map((msg, idx) => ({
          id: `msg-init-${Date.now()}-${idx}`,
          sender: msg.sender,
          text: msg.text,
          timestamp: 'Just now',
          quickReplies: msg.quickReplies
        }))
      );
    } else if (presetId === 'neo-tokyo-2099') {
      setMetadata(CYBERPUNK_STORY.metadata);
      setPanels(CYBERPUNK_STORY.panels);
      setMessages(
        CYBERPUNK_STORY.initialMessages.map((msg, idx) => ({
          id: `msg-init-${Date.now()}-${idx}`,
          sender: msg.sender,
          text: msg.text,
          timestamp: 'Just now',
          quickReplies: msg.quickReplies
        }))
      );
    } else if (presetId === 'new-blank') {
      const newMeta: StoryMetadata = {
        id: `story-${Date.now()}`,
        title: 'Untitled Visual Odyssey',
        genre: 'Sci-Fi / Adventure',
        visualStyle: 'Vibrant Anime',
        colorPalette: {
          primary: '#1e1b4b',
          secondary: '#4338ca',
          accent: '#f43f5e',
          background: '#312e81'
        },
        synopsis: 'A brand new story waiting to be told step by step with Vizzy.',
        characterNotes: 'Hero, Companion',
        aspectRatio: '16:9',
        author: 'User'
      };
      setMetadata(newMeta);
      setPanels([]);
      setMessages([
        {
          id: `msg-blank-init`,
          sender: 'vizzy',
          text: "✨ **Welcome to your new Visual Book!** I'm **Vizzy**. What genre and story premise would you like to create? (e.g. World War II historical, Sci-Fi Space Opera, Dark Fantasy dragon quest, or Indie Film Storyboard)",
          timestamp: 'Just now',
          quickReplies: ['World War II D-Day Drama', 'Cyberpunk Detective', 'Ethereal Fantasy Quest']
        }
      ]);
      setIsWizardOpen(true);
    }
  };

  // Update Visual Style globally
  const handleUpdateStyle = (newStyle: VisualStyle) => {
    setMetadata(prev => ({ ...prev, visualStyle: newStyle }));
    const styleMsg: ChatMessage = {
      id: `msg-style-${Date.now()}`,
      sender: 'vizzy',
      text: `🎨 **Visual Style updated to: ${newStyle}**. Future panels will render with this aesthetic!`,
      timestamp: 'Just now'
    };
    setMessages(prev => [...prev, styleMsg]);
  };

  // User sends message in Chat
  const handleSendMessage = (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let responseText = `I hear you! "${userText}". Let's incorporate that into our visual storyboard.`;
      let quickReplies = ['Generate Panel Options', 'Refine Dialogue', 'Preview Story Slideshow'];

      const lower = userText.toLowerCase();
      if (lower.includes('d-day') || lower.includes('breach') || lower.includes('war') || lower.includes('explosion')) {
        responseText = `💥 Excellent tactical direction for the graphic novel! I can generate 3 dramatic camera options for Panel ${panels.length + 1} depicting the breach through the seawall barbed wire.`;
        quickReplies = ['Generate Panel Options now', 'Add Private Jackson speech bubble'];
      } else if (lower.includes('style') || lower.includes('color') || lower.includes('accent')) {
        responseText = `🎨 Great aesthetic note! I'll tailor our color palette and line art rendering to emphasize high contrast and atmospheric depth.`;
      }

      const vizzyMsg: ChatMessage = {
        id: `msg-vizzy-${Date.now()}`,
        sender: 'vizzy',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies
      };
      setMessages(prev => [...prev, vizzyMsg]);
    }, 400);
  };

  // User selects an option from Vizzy Chat to add as new Panel
  const handleSelectOptionForNewPanel = (option: PanelOption, caption?: string, speech?: string) => {
    const newPanelNumber = panels.length + 1;
    const newPanel: StoryPanel = {
      id: `panel-${Date.now()}`,
      pageNumber: Math.ceil(newPanelNumber / 2),
      panelNumber: newPanelNumber,
      title: option.prompt || `Panel ${newPanelNumber}`,
      description: option.description,
      cameraAngle: option.cameraAngle,
      selectedOption: option,
      availableOptions: [option],
      filterEffect: metadata.visualStyle === 'WW2 Sepia Ink' ? 'sepia' : 'none',
      soundEffectCue: option.cameraAngle === 'Dramatic Close-Up' ? 'boom' : 'wave',
      textElements: [
        ...(caption ? [{
          id: `caption-${Date.now()}`,
          type: 'caption' as const,
          content: caption.toUpperCase(),
          position: { x: 5, y: 80 }
        }] : []),
        ...(speech ? [{
          id: `speech-${Date.now()}`,
          type: 'speech' as const,
          content: speech,
          speaker: 'Character',
          position: { x: 15, y: 15 }
        }] : [])
      ]
    };

    setPanels(prev => [...prev, newPanel]);

    const vizzyMsg: ChatMessage = {
      id: `msg-approved-${Date.now()}`,
      sender: 'vizzy',
      text: `🎉 **Panel ${newPanelNumber} Locked into Story!** Added "${newPanel.title}" using ${newPanel.cameraAngle} framing. You can edit speech bubbles on the right canvas or tell me what happens in Panel ${newPanelNumber + 1}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [`Add Panel ${newPanelNumber + 1}`, 'Play Slideshow Loop', 'Export PDF Book']
    };
    setMessages(prev => [...prev, vizzyMsg]);
  };

  // Panel re-ordering / actions
  const handleMovePanel = (panelId: string, direction: 'left' | 'right') => {
    const idx = panels.findIndex(p => p.id === panelId);
    if (idx === -1) return;
    const newIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= panels.length) return;

    const copy = [...panels];
    const temp = copy[idx];
    copy[idx] = copy[newIdx];
    copy[newIdx] = temp;
    setPanels(copy);
  };

  const handleDeletePanel = (panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
  };

  const handleSavePanelEdits = (updatedPanel: StoryPanel) => {
    setPanels(prev => prev.map(p => p.id === updatedPanel.id ? updatedPanel : p));
    setEditingPanel(null);
  };

  const handleOpenNewPanel = () => {
    const prompt = `Panel ${panels.length + 1} heroic breakthrough`;
    const options = generatePanelOptions(prompt, metadata.visualStyle, 'Cinematic Wide');
    handleSelectOptionForNewPanel(options[0], `PANEL ${panels.length + 1}`, `Charge!`);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navbar Header */}
      <Navbar
        metadata={metadata}
        panelCount={panels.length}
        onOpenNewPanel={handleOpenNewPanel}
        onStartSlideshow={() => setIsSlideshowOpen(true)}
        onExportPDF={() => exportStoryToPDF(metadata, panels)}
        onSwitchPreset={handleSwitchPreset}
        onUpdateStyle={handleUpdateStyle}
        onOpenSetupWizard={() => setIsWizardOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(audioService.toggleMute())}
      />

      {/* Main Dual-Pane Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Conversational Vizzy Chat Assistant (380px) */}
        <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 h-full">
          <VizzyChat
            metadata={metadata}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSelectOptionForNewPanel={handleSelectOptionForNewPanel}
            onUpdateStyle={handleUpdateStyle}
            panelCount={panels.length}
          />
        </div>

        {/* Right Pane: Graphic Novel Canvas / Storyboard Editor */}
        <div className="hidden md:flex flex-1 h-full">
          <PanelGrid
            panels={panels}
            metadata={metadata}
            onEditPanel={(panel) => setEditingPanel(panel)}
            onDeletePanel={handleDeletePanel}
            onMovePanel={handleMovePanel}
            onOpenNewPanel={handleOpenNewPanel}
          />
        </div>
      </div>

      {/* Story Setup Wizard Modal */}
      {isWizardOpen && (
        <StorySetupWizardModal
          metadata={metadata}
          onSaveMetadata={(newMeta) => setMetadata(newMeta)}
          onClose={() => setIsWizardOpen(false)}
        />
      )}

      {/* Panel Fine-Tuning Modal */}
      {editingPanel && (
        <PanelEditorModal
          panel={editingPanel}
          visualStyle={metadata.visualStyle}
          onSave={handleSavePanelEdits}
          onClose={() => setEditingPanel(null)}
        />
      )}

      {/* Auto-Running Loop / Slideshow Player */}
      {isSlideshowOpen && (
        <LoopSlideshowModal
          panels={panels}
          metadata={metadata}
          onClose={() => setIsSlideshowOpen(false)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(audioService.toggleMute())}
        />
      )}
    </div>
  );
}

export default App;
