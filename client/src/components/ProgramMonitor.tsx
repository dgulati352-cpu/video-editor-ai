import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { secondsToSMPTE } from '../utils/timecode';

export const ProgramMonitor: React.FC = () => {
  const {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    setPlaybackRate,
    frameRate,
    inPoint,
    outPoint,
    isSafeMarginsActive,
    togglePlayPause,
    stepFrame,
    setInPoint,
    setOutPoint,
    clearInOut,
    toggleSafeMargins,
    colorState,
    clips,
    resolution,
    quickSocialReframe,
    showToastBanner,
  } = useTimelineStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVertical = resolution.includes('9:16');

  // Active clip at current playhead
  const activeVideoClip = clips.find(
    (c) => c.type === 'video' && currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  // In / Out duration
  const markedDuration = inPoint !== null && outPoint !== null && outPoint > inPoint ? outPoint - inPoint : null;

  // Render simulated frame on canvas with color grading filters applied
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background canvas clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    if (activeVideoClip) {
      // Simulate video image drawing
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (activeVideoClip.id.includes('v3')) {
        // Drone shot
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e293b');
        gradient.addColorStop(1, '#334155');
      } else if (activeVideoClip.id.includes('v2')) {
        // Graphics title
        gradient.addColorStop(0, '#2e1065');
        gradient.addColorStop(0.5, '#4c1d95');
        gradient.addColorStop(1, '#6b21a8');
      } else {
        // A-Cam studio setup
        gradient.addColorStop(0, '#1c1917');
        gradient.addColorStop(0.4, '#292524');
        gradient.addColorStop(1, '#44403c');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Studio light bokeh & subtle motion simulation
      const bokehOffset = Math.sin(currentTime * 2) * 15;
      ctx.beginPath();
      ctx.arc(width * 0.7 + bokehOffset, height * 0.35, 120, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(width * 0.3 - bokehOffset, height * 0.65, 140, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.07)';
      ctx.fill();

      // Simulated Actor / Subject silhouette
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(width * 0.48, height * 0.42, 65, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(width * 0.48, height * 0.85, 120, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Simulated Lumetri Grade Overlays
      if (colorState.activeLut !== 'None') {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.04)';
        ctx.fillRect(0, 0, width, height);
      }

      // Clip title watermark & SMPTE Frame
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(activeVideoClip.title, 20, 30);
      ctx.fillText(`PRORES 422 HQ | ACEScg | ${secondsToSMPTE(currentTime, frameRate)}`, 20, 48);

      // Comparison mode split screen
      if (colorState.isSplitCompare) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#00e5ff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('RAW (REC.709)', width * 0.25 - 35, 30);
        ctx.fillText('GRADED (LUMETRI)', width * 0.75 - 45, 30);
      }
    } else {
      // Empty timeline gap / black
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#52525b';
      ctx.textAlign = 'center';
      ctx.fillText('NO MEDIA AT PLAYHEAD', width / 2, height / 2);
      ctx.textAlign = 'left';
    }

    // Safe Margins Overlay (90% Action Safe / 80% Title Safe)
    if (isSafeMarginsActive) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 1;

      // 90% Action Safe
      const pad90X = width * 0.05;
      const pad90Y = height * 0.05;
      ctx.strokeRect(pad90X, pad90Y, width * 0.9, height * 0.9);

      // 80% Title Safe
      const pad80X = width * 0.1;
      const pad80Y = height * 0.1;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
      ctx.strokeRect(pad80X, pad80Y, width * 0.8, height * 0.8);

      // Center Crosshair
      const cx = width / 2;
      const cy = height / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy);
      ctx.lineTo(cx + 15, cy);
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx, cy + 15);
      ctx.stroke();
    }
  }, [currentTime, activeVideoClip, isSafeMarginsActive, colorState, frameRate]);

  return (
    <div className="flex flex-col h-full bg-nle-canvas border-r border-nle-border text-xs select-none">
      {/* Monitor Header */}
      <div className="flex items-center justify-between px-3 h-9 bg-nle-header border-b border-nle-border">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-nle-accent">tv</span>
          <span className="font-semibold text-nle-text text-[11px] uppercase tracking-wider">
            Program: Sequence 01
          </span>
          {/* Resolution toggle pill */}
          <button
            onClick={quickSocialReframe}
            className={`px-2 py-0.5 rounded text-3xs font-mono font-semibold border transition-all flex items-center gap-1 ${
              isVertical
                ? 'bg-nle-accent/20 border-nle-accent text-nle-accent'
                : 'bg-nle-panel border-nle-border text-white hover:border-nle-accent'
            }`}
            title="Click to toggle between 4K Landscape (16:9) and Social Vertical (9:16)"
          >
            <span className="material-symbols-outlined text-[12px]">aspect_ratio</span>
            <span>{isVertical ? '9:16 Social' : '4K UHD 16:9'}</span>
          </button>
        </div>

        {/* Safe Margins & Zoom Controls */}
        <div className="flex items-center gap-2">
          {markedDuration !== null && (
            <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-nle-accent/10 border border-nle-accent/30 text-nle-accent font-semibold hidden sm:inline">
              In-Out: {markedDuration.toFixed(1)}s
            </span>
          )}

          <button
            onClick={toggleSafeMargins}
            className={`px-2 py-0.5 rounded text-3xs font-mono border transition-all ${
              isSafeMarginsActive
                ? 'bg-nle-amber/20 border-nle-amber/50 text-nle-amber font-semibold'
                : 'bg-nle-surface border-nle-border text-nle-dim hover:text-nle-text'
            }`}
            title="Toggle Safe Margins (90% Action / 80% Title)"
          >
            Safe Margins
          </button>

          <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-nle-surface border border-nle-border text-nle-dim">
            Fit (42%)
          </span>
        </div>
      </div>

      {/* Program Monitor Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center p-2 overflow-hidden">
        <div
          className={`relative h-full max-h-[480px] bg-nle-bg rounded-lg overflow-hidden shadow-2xl border border-nle-border/40 flex items-center justify-center transition-all duration-300 ${
            isVertical ? 'aspect-[9/16] w-auto' : 'aspect-video w-full'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={isVertical ? 540 : 960}
            height={isVertical ? 960 : 540}
            className="w-full h-full object-contain"
          />

          {/* Timecode & Playback HUD Overlay */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-mono text-[13px] text-white tracking-widest shadow-lg flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-nle-emerald animate-pulse' : 'bg-nle-crimson'
              }`}
            />
            <span className="font-bold text-nle-accent">{secondsToSMPTE(currentTime, frameRate)}</span>
            {playbackRate !== 1 && isPlaying && (
              <span className="text-3xs px-1 rounded bg-nle-accent text-black font-bold">
                {playbackRate}x
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Monitor Transport Bar */}
      <div className="flex items-center justify-between px-3 h-10 bg-nle-surface border-t border-nle-border">
        {/* Left: In/Out Buttons */}
        <div className="flex items-center gap-1 font-mono text-3xs">
          <button
            onClick={() => setInPoint()}
            className={`px-2 py-1 rounded border active:scale-95 transition-all ${
              inPoint !== null
                ? 'bg-nle-accent/20 border-nle-accent/60 text-nle-accent font-semibold'
                : 'bg-nle-panel hover:bg-nle-border border-nle-border text-nle-text'
            }`}
            title="Mark In Point (I)"
          >
            In {inPoint !== null ? `[${inPoint.toFixed(1)}s]` : ''}
          </button>

          <button
            onClick={() => setOutPoint()}
            className={`px-2 py-1 rounded border active:scale-95 transition-all ${
              outPoint !== null
                ? 'bg-nle-accent/20 border-nle-accent/60 text-nle-accent font-semibold'
                : 'bg-nle-panel hover:bg-nle-border border-nle-border text-nle-text'
            }`}
            title="Mark Out Point (O)"
          >
            Out {outPoint !== null ? `[${outPoint.toFixed(1)}s]` : ''}
          </button>

          {(inPoint !== null || outPoint !== null) && (
            <button
              onClick={clearInOut}
              className="p-1 rounded text-nle-dim hover:text-white"
              title="Clear In/Out Points"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Center: J-K-L Transport Controls */}
        <div className="flex items-center gap-1.5">
          {/* Rewind (J) */}
          <button
            onClick={() => setPlaybackRate(-1)}
            className={`p-1.5 rounded transition-colors ${
              playbackRate === -1 && isPlaying
                ? 'bg-nle-accent/20 text-nle-accent font-bold'
                : 'hover:bg-nle-panel text-nle-dim hover:text-nle-text'
            }`}
            title="Rewind / Reverse Play (J)"
          >
            <span className="material-symbols-outlined text-[18px]">fast_rewind</span>
          </button>

          {/* Step Back 1 Frame (Left) */}
          <button
            onClick={() => stepFrame(-1)}
            className="p-1.5 rounded hover:bg-nle-panel text-nle-dim hover:text-nle-text transition-colors"
            title="Step Back 1 Frame (←)"
          >
            <span className="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>

          {/* Play / Pause (Space / K) */}
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-nle-accent text-black flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)]"
            title="Play / Pause (Space / K)"
          >
            <span className="material-symbols-outlined text-[20px] fill-1 font-bold">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Step Forward 1 Frame (Right) */}
          <button
            onClick={() => stepFrame(1)}
            className="p-1.5 rounded hover:bg-nle-panel text-nle-dim hover:text-nle-text transition-colors"
            title="Step Forward 1 Frame (→)"
          >
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
          </button>

          {/* Fast Forward (L) */}
          <button
            onClick={() => setPlaybackRate(playbackRate === 1 ? 2 : 1)}
            className={`p-1.5 rounded transition-colors ${
              playbackRate > 1 && isPlaying
                ? 'bg-nle-accent/20 text-nle-accent font-bold'
                : 'hover:bg-nle-panel text-nle-dim hover:text-nle-text'
            }`}
            title="Play Forward / Fast Forward (L)"
          >
            <span className="material-symbols-outlined text-[18px]">fast_forward</span>
          </button>
        </div>

        {/* Right: Loop / Speed Telemetry */}
        <div className="flex items-center gap-2">
          {/* Quick Speed Selector */}
          <div className="hidden md:flex items-center bg-nle-panel rounded border border-nle-border p-0.5 font-mono text-3xs">
            {([0.5, 1, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackRate(spd)}
                className={`px-1.5 py-0.2 rounded transition-colors ${
                  playbackRate === spd && isPlaying
                    ? 'bg-nle-accent text-black font-bold'
                    : 'text-nle-dim hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <span className="text-3xs font-mono text-nle-emerald bg-nle-emerald/10 border border-nle-emerald/20 px-2 py-0.5 rounded">
            60 FPS
          </span>
        </div>
      </div>
    </div>
  );
};
