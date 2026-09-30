import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { VizzyChat } from './components/Chat/VizzyChat';
import { PanelGrid } from './components/Storyboard/PanelGrid';
import { PanelEditorModal } from './components/Storyboard/PanelEditorModal';
import { CookieConsent } from './components/CookieConsent';
import { LoopSlideshowModal } from './components/Slideshow/LoopSlideshowModal';
import { StorySetupWizardModal } from './components/Wizard/StorySetupWizardModal';
import { ProjectBibleModal } from './components/Bible/ProjectBibleModal';
import { D_DAY_STORY, CYBERPUNK_STORY } from './data/presetStories';
import { StoryPanel, ChatMessage, PanelOption, VisualStyle, StoryMetadata } from './types';
import { generatePanelOptions } from './services/imageGeneratorService';
import { exportStoryToPDF } from './services/pdfExportService';
import { audioService } from './services/audioService';
import { useStoryStore } from './stores/storyStore';
import { chatApi, storyApi, panelApi } from './services/apiClient';

export function App() {
  const { metadata, panels, messages, setMetadata, setPanels, setMessages, addPanel, addMessage, updatePanel, initDemoStory } = useStoryStore();
  const [editingPanel, setEditingPanel] = useState<StoryPanel | null>(null);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isBibleOpen, setIsBibleOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('Vizzy is typing...');

  useEffect(() => {
    if (!metadata) {
      initDemoStory(D_DAY_STORY);
      return;
    }
    const syncFromCloud = async () => {
      try {
        const res = await panelApi.getPanels(metadata.id);
        if (res.data && res.data.length > 0) {
          const cloudPanels: StoryPanel[] = res.data.map((p: any, idx: number) => ({
            id: p.id,
            pageNumber: p.page_number || Math.ceil((idx + 1) / 2),
            panelNumber: p.panel_number || idx + 1,
            title: p.title || `Panel ${idx + 1}`,
            description: p.description || '',
            cameraAngle: p.camera_angle || 'Cinematic Wide',
            filterEffect: p.filter_effect || 'none',
            soundEffectCue: p.sound_cue || 'wave',
            selectedOption: {
              id: p.id,
              imageUrl: p.image_url || 'https://images.pollinations.ai/prompt/cinematic%20comic%20panel?width=800&height=450&nologo=true',
              prompt: p.title || p.description,
              cameraAngle: p.camera_angle || 'Cinematic Wide',
              description: p.description || '',
              seed: p.image_seed || 42
            },
            availableOptions: [],
            textElements: p.text_elements || []
          }));
          setPanels(cloudPanels);
        }
      } catch (_err) {
        console.warn("Cloud sync status:", _err);
      }
    };
    syncFromCloud();
  }, [metadata?.id, initDemoStory]);

  const handleSwitchPreset = (presetId: string) => {
    audioService.playSoundFx('page_turn');
    if (presetId === '123e4567-e89b-12d3-a456-426614174000') {
      initDemoStory(D_DAY_STORY);
    } else if (presetId === '123e4567-e89b-12d3-a456-426614174001') {
      initDemoStory(CYBERPUNK_STORY);
    } else if (presetId === 'new-blank') {
      const newMeta: StoryMetadata = {
        id: crypto.randomUUID(),
        title: 'Untitled Visual Odyssey',
        genre: 'Sci-Fi / Adventure',
        visualStyle: 'Vibrant Anime',
        colorPalette: { primary: '#1e1b4b', secondary: '#4338ca', accent: '#f43f5e', background: '#312e81' },
        synopsis: 'A brand new story waiting to be told step by step with Vizzy.',
        characterNotes: 'Hero, Companion',
        aspectRatio: '16:9',
        author: 'User'
      };
      setMetadata(newMeta);
      setPanels([]);
      setMessages([{
        id: `msg-blank-init`,
        sender: 'vizzy',
        text: "✨ **Welcome to your new Visual Book!** I'm **Vizzy**. What genre and story premise would you like to create?",
        timestamp: 'Just now',
        quickReplies: ['World War II Drama', 'Cyberpunk Detective', 'Ethereal Fantasy']
      }]);
      setIsWizardOpen(true);
    }
  };

  const handleUpdateStyle = (newStyle: VisualStyle) => {
    if (metadata) {
      setMetadata({ ...metadata, visualStyle: newStyle });
      addMessage({
        id: `msg-style-${Date.now()}`,
        sender: 'vizzy',
        text: `🎨 **Visual Style updated to: ${newStyle}**. Future panels will render with this aesthetic!`,
        timestamp: 'Just now'
      });
    }
  };

  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addMessage(userMsg);

    if (metadata) {
      try {
        // Ensure story exists on AWS DB prior to sending chat message
        try {
          await storyApi.createStory({
            id: metadata.id,
            title: metadata.title,
            genre: metadata.genre,
            visual_style: metadata.visualStyle,
            synopsis: metadata.synopsis,
            character_notes: metadata.characterNotes,
            author: metadata.author
          });
        } catch (_err) {
          // Story may already exist
        }

        setIsTyping(true);
        setTypingStatus('✨ Thinking of the perfect response...');

        const res = await chatApi.sendMessage(metadata.id, userText);
        
        addMessage({
          id: res.data.id || `msg-${Date.now()}`,
          sender: 'vizzy',
          text: res.data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: res.data.quick_replies?.map((r: any) => r.label) || []
        });
      } catch (e) {
        addMessage({
          id: `msg-err-${Date.now()}`,
          sender: 'vizzy',
          text: "I am having trouble connecting to the backend! Using fallback mode. Generating panel now...",
          timestamp: 'Just now',
          quickReplies: ['Generate Panel Options']
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSelectOptionForNewPanel = async (option: PanelOption, caption?: string, speech?: string) => {
    const newPanelNumber = panels.length + 1;
    const newPanelId = crypto.randomUUID();
    const textElements = [
      ...(caption ? [{ id: `cap-${Date.now()}`, type: 'caption' as const, content: caption, position: { x: 5, y: 80 } }] : []),
      ...(speech ? [{ id: `spc-${Date.now()}`, type: 'speech' as const, content: speech, speaker: 'Character', position: { x: 15, y: 15 } }] : [])
    ];

    const newPanel: StoryPanel = {
      id: newPanelId,
      pageNumber: Math.ceil(newPanelNumber / 2),
      panelNumber: newPanelNumber,
      title: option.prompt || `Panel ${newPanelNumber}`,
      description: option.description,
      cameraAngle: option.cameraAngle,
      selectedOption: option,
      availableOptions: [option],
      filterEffect: metadata?.visualStyle === 'WW2 Sepia Ink' ? 'sepia' : 'none',
      soundEffectCue: option.cameraAngle === 'Dramatic Close-Up' ? 'boom' : 'wave',
      textElements
    };

    addPanel(newPanel);

    if (metadata) {
      try {
        await panelApi.createPanel(metadata.id, {
          id: newPanelId,
          page_number: newPanel.pageNumber,
          panel_number: newPanel.panelNumber,
          title: newPanel.title,
          description: newPanel.description,
          camera_angle: newPanel.cameraAngle,
          filter_effect: newPanel.filterEffect,
          sound_cue: newPanel.soundEffectCue,
          image_url: option.imageUrl,
          text_elements: textElements
        });
      } catch (_err) {
        console.warn("Failed to sync panel to cloud DB:", _err);
      }
    }

    addMessage({
      id: `msg-approved-${Date.now()}`,
      sender: 'vizzy',
      text: `🎉 **Panel ${newPanelNumber} Locked into Story!** You can edit speech bubbles on the right canvas or tell me what happens in Panel ${newPanelNumber + 1}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [`Add Panel ${newPanelNumber + 1}`, 'Play Slideshow Loop', 'Export PDF Book']
    });
  };

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

  const handleOpenNewPanel = () => {
    const prompt = `Panel ${panels.length + 1} heroic breakthrough`;
    const options = generatePanelOptions(prompt, metadata?.visualStyle || 'Cinematic Graphic Novel', 'Cinematic Wide');
    handleSelectOptionForNewPanel(options[0], `PANEL ${panels.length + 1}`, `Charge!`);
  };

  if (!metadata) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-900 font-sans">
      <Navbar
        metadata={metadata}
        panelCount={panels.length}
        onOpenNewPanel={handleOpenNewPanel}
        onStartSlideshow={() => setIsSlideshowOpen(true)}
        onExportPDF={() => exportStoryToPDF(metadata, panels)}
        onSwitchPreset={handleSwitchPreset}
        onUpdateStyle={handleUpdateStyle}
        onOpenSetupWizard={() => setIsWizardOpen(true)}
        onOpenProjectBible={() => setIsBibleOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(audioService.toggleMute())}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 h-full">
          <VizzyChat
            metadata={metadata}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSelectOptionForNewPanel={handleSelectOptionForNewPanel}
            onUpdateStyle={handleUpdateStyle}
            panelCount={panels.length}
            isTyping={isTyping}
            typingStatus={typingStatus}
          />
        </div>
        <div className="hidden md:flex flex-1 h-full">
          <PanelGrid
            panels={panels}
            metadata={metadata}
            onEditPanel={setEditingPanel}
            onDeletePanel={(id) => setPanels(panels.filter(p => p.id !== id))}
            onMovePanel={handleMovePanel}
            onOpenNewPanel={handleOpenNewPanel}
          />
        </div>
      </div>
      {isWizardOpen && (
        <StorySetupWizardModal
          metadata={metadata}
          onSaveMetadata={(newMeta) => { setMetadata(newMeta); setIsWizardOpen(false); }}
          onClose={() => setIsWizardOpen(false)}
        />
      )}
      {editingPanel && (
        <PanelEditorModal
          panel={editingPanel}
          visualStyle={metadata.visualStyle}
          onSave={async (updated) => { 
            updatePanel(updated.id, updated); 
            setEditingPanel(null);
            if (metadata) {
              try {
                await panelApi.updatePanel(metadata.id, updated.id, {
                  title: updated.title,
                  description: updated.description,
                  camera_angle: updated.cameraAngle,
                  filter_effect: updated.filterEffect,
                  sound_cue: updated.soundEffectCue,
                  image_url: updated.selectedOption.imageUrl,
                  text_elements: updated.textElements
                });
              } catch (_e) {}
            }
          }}
          onClose={() => setEditingPanel(null)}
        />
      )}
      {isSlideshowOpen && (
        <LoopSlideshowModal
          panels={panels}
          metadata={metadata}
          onClose={() => setIsSlideshowOpen(false)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(audioService.toggleMute())}
        />
      )}
      {isBibleOpen && (
        <ProjectBibleModal
          onClose={() => setIsBibleOpen(false)}
        />
      )}
      <CookieConsent />
    </div>
  );
}
export default App;
