import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { secondsToSMPTE } from '../utils/timecode';

export const ProgramMonitor: React.FC = () => {
  const {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    frameRate,
    isSafeMarginsActive,
    togglePlayPause,
    stepFrame,
    setInPoint,
    setOutPoint,
    clips,
    resolution,
  } = useTimelineStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active clip at current playhead
  const activeVideoClip = clips.find(
    (c) => c.type === 'video' && currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  // Render simulated frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // True Black canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (activeVideoClip) {
      // Simulate video gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#1c1917');
      gradient.addColorStop(0.5, '#292524');
      gradient.addColorStop(1, '#44403c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle video motion simulation
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeVideoClip.title, width / 2, height / 2);
    }

    // Safe Margins Overlay
    if (isSafeMarginsActive) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
      ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    }
  }, [currentTime, activeVideoClip, isSafeMarginsActive, frameRate]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#303030] text-xs select-none overflow-hidden">
      {/* Monitor Header Tab: Program: (no sequences) ≡ */}
      <div className="flex items-center justify-between px-3 h-7 bg-[#252525] border-b border-[#303030]">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-[11px] truncate">
            {clips.length > 0 ? 'Program: Sequence 01' : 'Program: (no sequences)'}
          </span>
          <span className="text-[#888888] text-[10px]">≡</span>
        </div>
      </div>

      {/* Program Monitor Canvas Viewport (True Black) */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {clips.length > 0 ? (
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center" />
        )}
      </div>

      {/* Authentic Premiere Pro Transport Controls Bar */}
      <div className="flex items-center justify-between px-3 h-8 bg-[#222222] border-t border-[#303030] text-[#a0a0a0]">
        {/* Left Timecode */}
        <span className="font-mono text-[11px] text-[#e1e1e1]">
          {secondsToSMPTE(currentTime, frameRate)}
        </span>

        {/* Center Transport Controls ({, }, |<, <, >, >|, +) */}
        <div className="flex items-center gap-2">
          {/* Mark In { */}
          <button
            onClick={() => setInPoint()}
            className="hover:text-white text-[12px] font-mono px-1"
            title="Mark In (I)"
          >
            {'{'}
          </button>

          {/* Mark Out } */}
          <button
            onClick={() => setOutPoint()}
            className="hover:text-white text-[12px] font-mono px-1"
            title="Mark Out (O)"
          >
            {'}'}
          </button>

          {/* Go to In |◀ */}
          <button
            onClick={() => stepFrame(-10)}
            className="hover:text-white text-[11px] px-1"
            title="Go to In (Shift+I)"
          >
            |◀
          </button>

          {/* Step Back ◀ */}
          <button
            onClick={() => stepFrame(-1)}
            className="hover:text-white text-[11px] px-1"
            title="Step Back 1 Frame (Left Arrow)"
          >
            ◀
          </button>

          {/* Play / Pause ▶ */}
          <button
            onClick={togglePlayPause}
            className="hover:text-white text-[12px] px-1"
            title="Play / Stop (Space)"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Step Forward ▶| */}
          <button
            onClick={() => stepFrame(1)}
            className="hover:text-white text-[11px] px-1"
            title="Step Forward 1 Frame (Right Arrow)"
          >
            ▶|
          </button>

          {/* Button Editor + */}
          <button
            className="hover:text-white text-[12px] font-bold px-1"
            title="Button Editor"
          >
            +
          </button>
        </div>

        {/* Right Timecode */}
        <span className="font-mono text-[11px] text-[#888888]">
          {secondsToSMPTE(duration, frameRate)}
        </span>
      </div>
    </div>
  );
};
