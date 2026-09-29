import { VisualStyle, CameraAngle, PanelOption } from '../types';

interface StyleConfig {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  skyGradient: string[];
  lineworkColor: string;
  glowColor: string;
}

const STYLE_CONFIGS: Record<VisualStyle, StyleConfig> = {
  'WW2 Sepia Ink': {
    primary: '#1c1917',
    secondary: '#78350f',
    accent: '#dc2626',
    bg: '#fef3c7',
    skyGradient: ['#1c1917', '#451a03', '#92400e', '#fef3c7'],
    lineworkColor: '#0a0a0a',
    glowColor: '#fef08a'
  },
  'Gritty Noir': {
    primary: '#09090b',
    secondary: '#27272a',
    accent: '#e11d48',
    bg: '#18181b',
    skyGradient: ['#09090b', '#18181b', '#3f3f46', '#e4e4e7'],
    lineworkColor: '#000000',
    glowColor: '#ffffff'
  },
  'Vibrant Anime': {
    primary: '#0f172a',
    secondary: '#312e81',
    accent: '#ec4899',
    bg: '#1e1b4b',
    skyGradient: ['#0f172a', '#4338ca', '#ec4899', '#fef08a'],
    lineworkColor: '#1e1b4b',
    glowColor: '#38bdf8'
  },
  'Cyberpunk Neon': {
    primary: '#030712',
    secondary: '#0f172a',
    accent: '#06b6d4',
    bg: '#111827',
    skyGradient: ['#030712', '#1e1b4b', '#d946ef', '#06b6d4'],
    lineworkColor: '#030712',
    glowColor: '#06b6d4'
  },
  'Dark Fantasy Watercolors': {
    primary: '#022c22',
    secondary: '#065f46',
    accent: '#facc15',
    bg: '#052e16',
    skyGradient: ['#022c22', '#064e3b', '#15803d', '#fef08a'],
    lineworkColor: '#022c22',
    glowColor: '#eab308'
  },
  'Classic 1950s Comic Book': {
    primary: '#1e3a8a',
    secondary: '#b91c1c',
    accent: '#facc15',
    bg: '#fef9c3',
    skyGradient: ['#1e3a8a', '#dc2626', '#facc15', '#ffffff'],
    lineworkColor: '#000000',
    glowColor: '#facc15'
  }
};

/**
 * SaaS-Grade Procedural Graphic Novel Art Generator
 * Renders atmospheric scenes with detailed silhouettes, dynamic lighting, weather & comic line art.
 */
export function generateArtCanvasUrl(
  prompt: string,
  style: VisualStyle,
  cameraAngle: CameraAngle,
  seed: number,
  width: number = 1080,
  height: number = 608
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cfg = STYLE_CONFIGS[style] || STYLE_CONFIGS['WW2 Sepia Ink'];
  const pLower = prompt.toLowerCase();

  // Deterministic seeded random
  const rand = (offset: number) => {
    const x = Math.sin(seed + offset * 1.5) * 10000;
    return x - Math.floor(x);
  };

  // 1. Sky & Atmospheric Gradient Backdrop
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, cfg.skyGradient[0]);
  skyGrad.addColorStop(0.35, cfg.skyGradient[1]);
  skyGrad.addColorStop(0.7, cfg.skyGradient[2]);
  skyGrad.addColorStop(1, cfg.skyGradient[3]);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Weather & Environment Shading
  const horizonY = height * 0.52;

  if (pLower.includes('d-day') || pLower.includes('beach') || pLower.includes('war') || pLower.includes('ship') || style === 'WW2 Sepia Ink') {
    // --- WW2 OMAHA BEACH & ARMADA ART ---
    
    // Distant Battleships Silhouette with details
    for (let b = 0; b < 6; b++) {
      const bx = width * (0.05 + b * 0.16 + rand(b) * 0.05);
      const bw = 50 + rand(b + 1) * 70;
      const bh = 18 + rand(b + 2) * 25;
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fillRect(bx, horizonY - bh, bw, bh);
      // Masts & Turrets
      ctx.fillRect(bx + bw * 0.3, horizonY - bh - 22, 4, 22);
      ctx.fillRect(bx + bw * 0.6, horizonY - bh - 16, 3, 16);
      ctx.fillRect(bx + 5, horizonY - bh + 4, 12, 6);
    }

    // Rough Ocean Sea & Foam
    const oceanGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    oceanGrad.addColorStop(0, '#1e293b');
    oceanGrad.addColorStop(0.5, '#0f172a');
    oceanGrad.addColorStop(1, '#020617');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Wave crest lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let w = 0; w < 16; w++) {
      const wy = horizonY + rand(w * 3) * (height - horizonY * 0.8);
      ctx.beginPath();
      ctx.moveTo(0, wy);
      ctx.bezierCurveTo(width * 0.25, wy - 12, width * 0.6, wy + 12, width, wy);
      ctx.stroke();
    }

    // Sandy Seawall Slope
    ctx.fillStyle = '#291e17';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.quadraticCurveTo(width * 0.5, height * 0.68, width, height * 0.78);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Explosions & Volumetric Smoke Plumes
    for (let e = 0; e < 3; e++) {
      const ex = width * (0.2 + e * 0.3 + rand(e) * 0.1);
      const ey = horizonY - 15 + rand(e + 5) * 30;
      
      const fire = ctx.createRadialGradient(ex, ey, 5, ex, ey, 60);
      fire.addColorStop(0, '#fef08a');
      fire.addColorStop(0.3, '#f97316');
      fire.addColorStop(0.7, 'rgba(220, 38, 38, 0.7)');
      fire.addColorStop(1, 'transparent');
      
      ctx.fillStyle = fire;
      ctx.beginPath();
      ctx.arc(ex, ey, 60, 0, Math.PI * 2);
      ctx.fill();

      // Smoke clouds rising
      ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
      ctx.beginPath();
      ctx.arc(ex - 20, ey - 50, 45, 0, Math.PI * 2);
      ctx.arc(ex + 25, ey - 90, 60, 0, Math.PI * 2);
      ctx.arc(ex - 10, ey - 140, 75, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'Cyberpunk Neon') {
    // --- CYBERPUNK CITYSCAPE ---
    const groundY = height * 0.68;
    for (let c = 0; c < 12; c++) {
      const cx = c * 90;
      const cw = 60 + rand(c) * 50;
      const ch = 180 + rand(c + 3) * 260;
      
      ctx.fillStyle = '#030712';
      ctx.fillRect(cx, groundY - ch, cw, ch);

      // Glowing Neon Advertising & Windows
      ctx.fillStyle = (c % 2 === 0) ? '#06b6d4' : '#ec4899';
      for (let wy = groundY - ch + 20; wy < groundY - 20; wy += 25) {
        if (rand(wy + c) > 0.35) {
          ctx.fillRect(cx + 8, wy, 10, 10);
          ctx.fillRect(cx + cw - 18, wy, 10, 10);
        }
      }

      // Neon Signboards
      if (c % 3 === 0) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + 15, groundY - ch + 40, cw - 30, 15);
      }
    }

    // Rain lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 60; r++) {
      const rx = rand(r) * width;
      const ry = rand(r + 1) * height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 15, ry + 40);
      ctx.stroke();
    }
  } else {
    // Sun / Moon / Celestial Orb
    const cx = width * 0.72;
    const cy = height * 0.28;
    const moon = ctx.createRadialGradient(cx, cy, 10, cx, cy, 100);
    moon.addColorStop(0, cfg.glowColor);
    moon.addColorStop(0.4, 'rgba(253, 224, 71, 0.4)');
    moon.addColorStop(1, 'transparent');
    ctx.fillStyle = moon;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Detailed Character Silhouettes based on Camera Angle
  ctx.save();

  if (cameraAngle === 'Dramatic Close-Up') {
    // --- CLOSE-UP HERO PORTRAIT ---
    const headX = width * 0.5;
    const headY = height * 0.46;

    // Detailed Helmet
    ctx.fillStyle = cfg.primary;
    ctx.beginPath();
    ctx.ellipse(headX, headY, 150, 180, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helmet Dome
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(headX, headY - 60, 165, Math.PI, 0, false);
    ctx.fill();

    // Strap & Goggles / Eye expression
    ctx.strokeStyle = cfg.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(headX, headY - 10, 145, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Eye highlight glow
    ctx.fillStyle = cfg.glowColor;
    ctx.beginPath();
    ctx.ellipse(headX - 50, headY - 20, 20, 9, -0.1, 0, Math.PI * 2);
    ctx.ellipse(headX + 50, headY - 20, 20, 9, 0.1, 0, Math.PI * 2);
    ctx.fill();

  } else if (cameraAngle === 'Over-The-Shoulder') {
    // --- OVER-THE-SHOULDER PERSPECTIVE ---
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.ellipse(width * 0.18, height * 0.85, 230, 260, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Target Subject in focus
    ctx.fillStyle = cfg.primary;
    ctx.fillRect(width * 0.62, height * 0.42, 70, 160);
    ctx.beginPath();
    ctx.arc(width * 0.62 + 35, height * 0.36, 30, 0, Math.PI * 2);
    ctx.fill();

  } else if (cameraAngle === 'Low Angle Hero') {
    // --- LOW ANGLE HEROIC SHOT ---
    const heroX = width * 0.5;
    ctx.fillStyle = cfg.primary;
    ctx.beginPath();
    ctx.moveTo(heroX - 110, height);
    ctx.lineTo(heroX - 50, height * 0.32);
    ctx.lineTo(heroX + 50, height * 0.32);
    ctx.lineTo(heroX + 110, height);
    ctx.closePath();
    ctx.fill();

    // Head with helmet
    ctx.beginPath();
    ctx.arc(heroX, height * 0.22, 55, 0, Math.PI * 2);
    ctx.fill();

    // Rifle / Weapon pointing up
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(heroX + 30, height * 0.5);
    ctx.lineTo(heroX + 130, height * 0.1);
    ctx.stroke();

  } else {
    // --- CINEMATIC WIDE LANDING BOAT / SQUAD ASSAULT ---
    if (pLower.includes('landing craft') || pLower.includes('higgins') || pLower.includes('boat') || pLower.includes('d-day')) {
      const boatX = width * 0.22;
      const boatY = height * 0.42;

      // Steel Landing Craft Ramp
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(boatX, boatY);
      ctx.lineTo(boatX + 460, boatY);
      ctx.lineTo(boatX + 520, boatY + 220);
      ctx.lineTo(boatX - 60, boatY + 220);
      ctx.closePath();
      ctx.fill();

      // Soldiers charging forward out of water
      for (let s = 0; s < 6; s++) {
        const sx = boatX + 30 + s * 75;
        const sy = boatY + 50 + (s % 2) * 22;
        
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(sx, sy, 30, 70);
        
        // Helmet
        ctx.beginPath();
        ctx.arc(sx + 15, sy - 12, 18, 0, Math.PI * 2);
        ctx.fill();

        // M1 Garand Rifle
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(sx + 10, sy + 25);
        ctx.lineTo(sx + 50, sy - 15);
        ctx.stroke();
      }
    } else {
      // Squad Panorama
      for (let s = 0; s < 5; s++) {
        const sx = width * (0.2 + s * 0.15);
        const sy = height * 0.46 + (s % 2) * 20;
        ctx.fillStyle = cfg.primary;
        ctx.fillRect(sx, sy, 40, 100);
        ctx.beginPath();
        ctx.arc(sx + 20, sy - 18, 24, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();

  // 4. Comic Book Halftone Dots & Linework Shading
  ctx.strokeStyle = cfg.lineworkColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Cross hatching shading
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < width; i += 28) {
    ctx.beginPath();
    ctx.moveTo(i, height);
    ctx.lineTo(i + 90, height - 140);
    ctx.stroke();
  }

  // Widescreen Letterbox Frame
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, 26);
  ctx.fillRect(0, height - 26, width, 26);

  return canvas.toDataURL('image/png');
}

/**
 * Generate 3 distinct high-quality visual options for Vizzy chat
 */
export function generatePanelOptions(
  prompt: string,
  style: VisualStyle,
  baseCamera: CameraAngle = 'Cinematic Wide'
): PanelOption[] {
  const angles: CameraAngle[] = [
    baseCamera,
    baseCamera === 'Dramatic Close-Up' ? 'Cinematic Wide' : 'Dramatic Close-Up',
    baseCamera === 'Low Angle Hero' ? 'Over-The-Shoulder' : 'Low Angle Hero'
  ];

  const descriptions = [
    `Option A: ${angles[0]} shot establishing environmental scale & squad momentum.`,
    `Option B: ${angles[1]} shot capturing high-stakes emotional focus & tension.`,
    `Option C: ${angles[2]} shot emphasizing dramatic low-angle heroic action.`
  ];

  const tones = [
    'Gritty golden hour lighting with dark silhouettes and sea spray',
    'High-contrast chiaroscuro shadows with explosive highlights',
    'Desaturated cinematic tone with bold comic ink outlines'
  ];

  return angles.map((angle, index) => {
    const seed = Math.floor(Math.random() * 999999) + index * 3456;
    const imageUrl = generateArtCanvasUrl(prompt, style, angle, seed);
    return {
      id: `option-${Date.now()}-${index}`,
      imageUrl,
      seed,
      prompt,
      cameraAngle: angle,
      lightingTone: tones[index],
      description: descriptions[index]
    };
  });
}
