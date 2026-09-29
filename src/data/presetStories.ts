import { StoryMetadata, StoryPanel } from '../types';
import { generateArtCanvasUrl } from '../services/imageGeneratorService';

export interface PresetStory {
  metadata: StoryMetadata;
  panels: StoryPanel[];
  initialMessages: Array<{
    sender: 'vizzy' | 'user';
    text: string;
    quickReplies?: string[];
  }>;
}

export const D_DAY_STORY: PresetStory = {
  metadata: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'D-Day: Dawn at Omaha Beach',
    genre: 'Historical War Drama',
    visualStyle: 'WW2 Sepia Ink',
    colorPalette: {
      primary: '#1c1917',
      secondary: '#78350f',
      accent: '#dc2626',
      background: '#fef3c7'
    },
    synopsis: 'June 6, 1944. Allied forces launch the largest amphibious invasion in history. Captain Miller and his platoon push through heavy fire to breach the sea wall.',
    characterNotes: 'Captain Miller (Battle-hardened leader), Private Jackson (Tense young recruit), Sergeant Sullivan (Relentless tactical veteran).',
    aspectRatio: '16:9',
    author: 'Collaborative with Vizzy'
  },
  panels: [
    {
      id: 'panel-1',
      pageNumber: 1,
      panelNumber: 1,
      title: 'The Allied Armada',
      description: 'Dawn breaks over the English Channel as thousands of ships cut through dark choppy waters toward the Normandy coast.',
      cameraAngle: 'Cinematic Wide',
      selectedOption: {
        id: 'opt-dday-1',
        imageUrl: generateArtCanvasUrl(
          'D-Day allied warship fleet on choppy sea at dawn with dramatic sky',
          'WW2 Sepia Ink',
          'Cinematic Wide',
          101
        ),
        seed: 101,
        prompt: 'D-Day allied warship fleet on choppy sea at dawn with dramatic sky',
        cameraAngle: 'Cinematic Wide',
        lightingTone: 'Cold overcast morning light',
        description: 'Wide panorama showing naval power cutting through misty waves.'
      },
      availableOptions: [],
      textElements: [
        {
          id: 'text-1-1',
          type: 'caption',
          content: 'JUNE 6, 1944 — 0530 HOURS. THE ENGLISH CHANNEL.',
          position: { x: 5, y: 8 }
        },
        {
          id: 'text-1-2',
          type: 'thought',
          content: '3,000 ships. The destiny of the free world rides on this tide...',
          speaker: 'Captain Miller',
          position: { x: 55, y: 20 }
        }
      ],
      filterEffect: 'vintage',
      durationSeconds: 4,
      soundEffectCue: 'wave'
    },
    {
      id: 'panel-2',
      pageNumber: 1,
      panelNumber: 2,
      title: 'Inside the Landing Craft',
      description: 'Inside the Higgins boat, tense soldiers brace themselves as artillery shells splash close by.',
      cameraAngle: 'Over-The-Shoulder',
      selectedOption: {
        id: 'opt-dday-2',
        imageUrl: generateArtCanvasUrl(
          'Inside Higgins boat landing craft soldiers helmet tense expression splash',
          'WW2 Sepia Ink',
          'Over-The-Shoulder',
          102
        ),
        seed: 102,
        prompt: 'Inside Higgins boat landing craft soldiers helmet tense expression splash',
        cameraAngle: 'Over-The-Shoulder',
        lightingTone: 'High-contrast shadows inside steel hull',
        description: 'Tense over-the-shoulder view looking over soldiers at approaching shore.'
      },
      availableOptions: [],
      textElements: [
        {
          id: 'text-2-1',
          type: 'speech',
          content: 'KEEP YOUR HEADS DOWN! THIRTY SECONDS TO RAMP DROP!',
          speaker: 'Sergeant Sullivan',
          position: { x: 10, y: 15 }
        },
        {
          id: 'text-2-2',
          type: 'soundfx',
          content: 'BOOOM!!',
          position: { x: 70, y: 10 }
        }
      ],
      filterEffect: 'contrast',
      durationSeconds: 5,
      soundEffectCue: 'boom'
    },
    {
      id: 'panel-3',
      pageNumber: 1,
      panelNumber: 3,
      title: 'Ramp Drops',
      description: 'The front ramp crashes down into surf under heavy machine gun fire.',
      cameraAngle: 'Dramatic Close-Up',
      selectedOption: {
        id: 'opt-dday-3',
        imageUrl: generateArtCanvasUrl(
          'D-Day landing ramp drops captain miller hero face intense splash',
          'WW2 Sepia Ink',
          'Dramatic Close-Up',
          103
        ),
        seed: 103,
        prompt: 'D-Day landing ramp drops captain miller hero face intense splash',
        cameraAngle: 'Dramatic Close-Up',
        lightingTone: 'Blinding muzzle flashes and water spray',
        description: 'Close-up of Captain Miller signaling his men into the surf.'
      },
      availableOptions: [],
      textElements: [
        {
          id: 'text-3-1',
          type: 'speech',
          content: 'MOVE OUT! GET TO THE SEAWALL! GO GO GO!',
          speaker: 'Captain Miller',
          position: { x: 15, y: 20 }
        },
        {
          id: 'text-3-2',
          type: 'soundfx',
          content: 'RAT-TAT-TAT-TAT!',
          position: { x: 60, y: 12 }
        }
      ],
      filterEffect: 'sepia',
      durationSeconds: 4,
      soundEffectCue: 'boom'
    },
    {
      id: 'panel-4',
      pageNumber: 1,
      panelNumber: 4,
      title: 'Rallying at the Seawall',
      description: 'Miller\'s squad reaches the base of the shingle wall, preparing Bangalore torpedoes to blow a path through the wire.',
      cameraAngle: 'Low Angle Hero',
      selectedOption: {
        id: 'opt-dday-4',
        imageUrl: generateArtCanvasUrl(
          'Soldiers at seawall hero low angle setting bangalore torpedo breach',
          'WW2 Sepia Ink',
          'Low Angle Hero',
          104
        ),
        seed: 104,
        prompt: 'Soldiers at seawall hero low angle setting bangalore torpedo breach',
        cameraAngle: 'Low Angle Hero',
        lightingTone: 'Low-angle hero lighting against smoke-filled sky',
        description: 'Low angle shot of Miller and Sullivan priming explosives.'
      },
      availableOptions: [],
      textElements: [
        {
          id: 'text-4-1',
          type: 'speech',
          content: 'Pipe is primed! Clear the line!',
          speaker: 'Private Jackson',
          position: { x: 10, y: 15 }
        },
        {
          id: 'text-4-2',
          type: 'caption',
          content: 'OMAHA BEACH — 0645 HOURS. THE BREAKTHROUGH BEGINS.',
          position: { x: 15, y: 82 }
        }
      ],
      filterEffect: 'vintage',
      durationSeconds: 5,
      soundEffectCue: 'trumpet'
    }
  ],
  initialMessages: [
    {
      sender: 'vizzy',
      text: "👋 Welcome! I'm **Vizzy**, your AI graphic novel co-creator! We've loaded the **D-Day: Dawn at Omaha Beach** storyboard project.",
      quickReplies: ['Add Panel 5: Explosive Breach', 'Refine Panel 4', 'Change Visual Style', 'Play Slideshow Loop']
    },
    {
      sender: 'vizzy',
      text: "We currently have **4 panels** depicting the assault on Normandy. What would you like to build for **Panel 5**? Should we show the Bangalore torpedo detonation breaching the barbed wire defenses, or focus on a tactical sniper moment with Private Jackson?"
    }
  ]
};

export const CYBERPUNK_STORY: PresetStory = {
  metadata: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Neo-Tokyo 2099: Cyber Heist',
    genre: 'Sci-Fi Cyberpunk',
    visualStyle: 'Cyberpunk Neon',
    colorPalette: {
      primary: '#030712',
      secondary: '#0f172a',
      accent: '#06b6d4',
      background: '#111827'
    },
    synopsis: 'In a rain-drenched cyberpunk metropolis, rogue netrunner Kael breaks into the top-secret vault of Kurogane Industries.',
    characterNotes: 'Kael (Augmented hacker), Vesper (Drone pilot & tactical overwatch).',
    aspectRatio: '16:9',
    author: 'Collaborative with Vizzy'
  },
  panels: [
    {
      id: 'panel-c1',
      pageNumber: 1,
      panelNumber: 1,
      title: 'Neon Rain',
      description: 'Kael stands atop a soaring skyscraper looking down at the rain-soaked neon glow of the city.',
      cameraAngle: 'Cinematic Wide',
      selectedOption: {
        id: 'opt-c1',
        imageUrl: generateArtCanvasUrl(
          'Cyberpunk skyscraper rain neon city hologram netrunner silhouette',
          'Cyberpunk Neon',
          'Cinematic Wide',
          201
        ),
        seed: 201,
        prompt: 'Cyberpunk skyscraper rain neon city hologram netrunner silhouette',
        cameraAngle: 'Cinematic Wide',
        lightingTone: 'Electric cyan & magenta neon reflection',
        description: 'Panoramic view of towering neon skyscrapers in rain.'
      },
      availableOptions: [],
      textElements: [
        {
          id: 'ctext-1',
          type: 'caption',
          content: 'NEO-TOKYO, LEVEL 400 — 02:14 AM.',
          position: { x: 5, y: 8 }
        },
        {
          id: 'ctext-2',
          type: 'speech',
          content: 'Security grid is down. You have 3 minutes, Kael.',
          speaker: 'Vesper (Comms)',
          position: { x: 50, y: 18 }
        }
      ],
      filterEffect: 'neon',
      durationSeconds: 4,
      soundEffectCue: 'synth_drone'
    },
    {
      id: 'panel-c2',
      pageNumber: 1,
      panelNumber: 2,
      title: 'Breaching the Data Core',
      description: 'Kael plugs neural jacks directly into the quantum server node.',
      cameraAngle: 'Dramatic Close-Up',
      selectedOption: {
        id: 'opt-c2',
        imageUrl: generateArtCanvasUrl(
          'Cyberpunk neural jack plug server glowing quantum optic core hacker eyes',
          'Cyberpunk Neon',
          'Dramatic Close-Up',
          202
        ),
        seed: 202,
        prompt: 'Cyberpunk neural jack plug server glowing quantum optic core hacker eyes',
        cameraAngle: 'Dramatic Close-Up',
        lightingTone: 'Blinding blue fiber optic flare',
        description: 'Close up on neural interface glowing blue.'
      },
      availableOptions: [],
      textElements: [
        {
          id: 'ctext-3',
          type: 'speech',
          content: 'Bypassing the firewall now... almost in!',
          speaker: 'Kael',
          position: { x: 10, y: 15 }
        },
        {
          id: 'ctext-4',
          type: 'soundfx',
          content: 'Zzz-BZZZT!',
          position: { x: 65, y: 12 }
        }
      ],
      filterEffect: 'neon',
      durationSeconds: 5,
      soundEffectCue: 'synth_drone'
    }
  ],
  initialMessages: [
    {
      sender: 'vizzy',
      text: "⚡ **Neo-Tokyo 2099** loaded! Vizzy here. We have 2 cyberpunk panels set up. Tell me what happens next in Kael's heist!",
      quickReplies: ['Security Drones Attack!', 'Extract the AI Core', 'Escape via Zip-Line']
    }
  ]
};
