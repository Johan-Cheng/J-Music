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
}

const NOTE_CHARS = ['♩', '♪', '♫', '♬', '🎵', '🎶', '⭐', '✨', '🌟', '♭', '𝄞'];
const NEON_COLORS = [
  '#00D9FF', // Cyan
  '#67FFD4', // Mint
  '#9C7BFF', // Violet
  '#FF5FC8', // Pink
  '#FFD700', // Gold/Yellow Star
  '#FF4500', // Orange neon
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

    const count = window.innerWidth < 768 ? 24 : 45;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const char = NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)];
      const isStar = char === '⭐' || char === '✨' || char === '🌟';
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char,
        size: Math.random() * 18 + 12,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: -(Math.random() * 0.8 + 0.3),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        opacity: Math.random() * 0.35 + 0.15,
        isStar,
      });
    }

    const render = () => {
      if (isTabVisible && ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particles) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;

          // Twinkle effect for stars
          if (p.isStar) {
            p.opacity += (Math.random() - 0.5) * 0.05;
            if (p.opacity < 0.1) p.opacity = 0.1;
            if (p.opacity > 0.6) p.opacity = 0.6;
          }

          // Wrap around edges
          if (p.y < -40) {
            p.y = canvas.height + 20;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -40) p.x = canvas.width + 20;
          if (p.x > canvas.width + 40) p.x = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
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
      style={{ opacity: 0.95 }}
    />
  );
};
