import React, { useEffect, useRef } from 'react';

interface BackgroundCanvasProps {
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  char: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  opacity: number;
  isStar?: boolean;
  waveAngle: number;
  waveSpeed: number;
}

const NOTE_CHARS = ['♩', '♪', '♫', '♬', '🎵', '🎶', '⭐', '✨', '🌟', '♭', '𝄞', '🎙️', '🎧', '🎸', '🎹'];
const NEON_COLORS = [
  '#00D9FF', // Cyan
  '#67FFD4', // Mint
  '#9C7BFF', // Violet
  '#FF5FC8', // Pink
  '#FFD700', // Gold Star
  '#FF4500', // Neon Orange
  '#39FF14', // Neon Green
];

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isTabVisible = !document.hidden;

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = window.innerWidth < 768 ? 30 : 55;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const char = NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)];
      const isStar = char === '⭐' || char === '✨' || char === '🌟';
      const movingRight = Math.random() > 0.5;
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char,
        size: Math.random() * 20 + 12, // 12px to 32px
        speedX: (movingRight ? 1 : -1) * (Math.random() * 0.8 + 0.3), // Flying left-to-right or right-to-left
        speedY: (Math.random() - 0.5) * 0.4, // subtle vertical drift
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        opacity: Math.random() * 0.4 + 0.2, // Vibrant neon visibility
        isStar,
        waveAngle: Math.random() * Math.PI * 2,
        waveSpeed: Math.random() * 0.03 + 0.015, // Up and down floating wave speed
      });
    }

    const render = () => {
      if (isTabVisible && ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particles) {
          p.x += p.speedX;
          p.waveAngle += p.waveSpeed;
          p.y += p.speedY + Math.sin(p.waveAngle) * 0.6; // Bobbing up and down while flying across
          p.rotation += p.rotSpeed;

          // Twinkle effect for stars
          if (p.isStar) {
            p.opacity += (Math.random() - 0.5) * 0.08;
            if (p.opacity < 0.15) p.opacity = 0.15;
            if (p.opacity > 0.7) p.opacity = 0.7;
          }

          // Wrap around screen bounds (Left <-> Right)
          if (p.x < -60) {
            p.x = canvas.width + 50;
            p.y = Math.random() * canvas.height;
          } else if (p.x > canvas.width + 60) {
            p.x = -50;
            p.y = Math.random() * canvas.height;
          }

          // Wrap vertically
          if (p.y < -50) p.y = canvas.height + 40;
          if (p.y > canvas.height + 50) p.y = -40;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.font = `${p.size}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className="fixed inset-0 pointer-events-none bg-[#071122] -z-10" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
      style={{ opacity: 0.98 }}
    />
  );
};
