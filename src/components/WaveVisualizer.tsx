import React, { useEffect, useRef } from 'react';

interface WaveVisualizerProps {
  waveHeight: number; // in meters (0.2 - 8.0)
  wavePeriod?: number; // in seconds (3 - 16)
  windSpeed?: number; // in km/h (5 - 90)
  height?: number;
  className?: string;
  showLabels?: boolean;
}

export const WaveVisualizer: React.FC<WaveVisualizerProps> = ({
  waveHeight = 2.0,
  wavePeriod = 8.0,
  windSpeed = 25.0,
  height = 140,
  className = '',
  showLabels = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    // Resize canvas based on client bounding rect
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!canvas) return;
      const width = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, h);

      // Speed inversely proportional to period, accelerated by wind
      const speed = (1 / Math.max(3, wavePeriod)) * 1.8 + (windSpeed / 120);
      step += speed * 0.04;

      // Amplitude scales with wave height
      const baseAmplitude = Math.min(h * 0.38, Math.max(10, waveHeight * 12));
      const wavelength = Math.max(60, wavePeriod * 18);

      // Wave Layers (Back to Front)
      const layers = [
        {
          color: 'rgba(2, 132, 199, 0.25)', // Deep sky blue
          ampFactor: 0.6,
          freqFactor: 0.8,
          phase: 1.2,
          yOffset: h * 0.58,
        },
        {
          color: 'rgba(6, 182, 212, 0.35)', // Cyan
          ampFactor: 0.85,
          freqFactor: 1.1,
          phase: 2.5,
          yOffset: h * 0.62,
        },
        {
          color: 'rgba(14, 165, 233, 0.65)', // Bright Ocean Blue
          ampFactor: 1.0,
          freqFactor: 1.0,
          phase: 0.0,
          yOffset: h * 0.66,
        },
      ];

      layers.forEach((layer) => {
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= width; x += 4) {
          const k = (2 * Math.PI) / (wavelength * layer.freqFactor);
          // Gerstner non-linear peak steepening
          const sine = Math.sin(k * x + step + layer.phase);
          const steepness = Math.pow(Math.sin((k * x + step + layer.phase) / 2), 2) * 0.3;
          const y = layer.yOffset - Math.sin(k * x + step + layer.phase) * (baseAmplitude * layer.ampFactor) - (steepness * 6);

          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, h);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      });

      // Crest Foam for High Waves (> 2.5m)
      if (waveHeight >= 2.5) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const k = (2 * Math.PI) / wavelength;
          const sine = Math.sin(k * x + step);
          if (sine > 0.82) {
            const y = h * 0.66 - Math.sin(k * x + step) * baseAmplitude;
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          }
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [waveHeight, wavePeriod, windSpeed, height]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px`, width: '100%' }}
        className="block w-full"
      />
      {showLabels && (
        <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-none text-xs">
          <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono font-medium">Hs: {waveHeight.toFixed(1)}m</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-400">Tp: {wavePeriod.toFixed(1)}s</span>
          </div>
          <span className="bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 font-mono text-slate-400 text-[11px]">
            Wind: {windSpeed.toFixed(0)} km/h
          </span>
        </div>
      )}
    </div>
  );
};
