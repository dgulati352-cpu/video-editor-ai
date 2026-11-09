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
    mediaAssets,
    resolution,
  } = useTimelineStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const sequenceEnd =
    clips.length > 0 ? Math.max(...clips.map((c) => c.startTime + c.duration)) : duration;

  // Active visual clip at current playhead (if playhead stopped at exact end, freeze on final frame)
  const activeClip =
    clips.find(
      (c) =>
        (c.type === 'video' || /\.(mp4|mov|webm|mkv|avi|jpg|jpeg|png|webp|gif|svg)$/i.test(c.title)) &&
        currentTime >= c.startTime &&
        currentTime <= c.startTime + c.duration
    ) ||
    (sequenceEnd > 0 && currentTime >= sequenceEnd - 0.05
      ? [...clips]
          .reverse()
          .find(
            (c) =>
              c.type === 'video' ||
              /\.(mp4|mov|webm|mkv|avi|jpg|jpeg|png|webp|gif|svg)$/i.test(c.title)
          )
      : undefined);

  // Lookup actual mediaUrl (from clip or from mediaAssets)
  const mediaAsset = mediaAssets.find(
    (a) => a.name === activeClip?.title || a.id === activeClip?.id || (activeClip?.title && a.name.includes(activeClip.title))
  );
  const mediaUrl = activeClip?.mediaUrl || mediaAsset?.url || mediaAsset?.thumbnail;

  const isVideo = activeClip ? /\.(mp4|mov|webm|mkv|avi)$/i.test(activeClip.title) : false;

  // Synchronize HTML5 video element with timeline playhead
  useEffect(() => {
    const vid = videoRef.current;
    if (vid && activeClip && isVideo) {
      const localTime = Math.max(
        0,
        Math.min(activeClip.duration, (currentTime - activeClip.startTime) * (activeClip.speed || 1))
      );
      if (Math.abs(vid.currentTime - localTime) > 0.25) {
        vid.currentTime = localTime;
      }
      if (isPlaying) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    }
  }, [currentTime, isPlaying, activeClip, isVideo]);

  const { isLooping, toggleLooping } = useTimelineStore();

  const clipTransform = activeClip?.transform;
  const clipColor = activeClip?.colorAdjust;

  const posX = clipTransform?.positionX ?? 0;
  const posY = clipTransform?.positionY ?? 0;
  const scale = clipTransform?.scale ?? 100;
  const rotation = clipTransform?.rotation ?? 0;
  const opacity = (clipTransform?.opacity ?? 100) / 100;

  const exposure = clipColor?.exposure ?? 0;
  const contrast = clipColor?.contrast ?? 0;
  const saturation = clipColor?.saturation ?? 100;

  const visualStyle: React.CSSProperties = {
    transform: `translate(${posX}px, ${posY}px) scale(${scale / 100}) rotate(${rotation}deg)`,
    opacity,
    filter: `brightness(${1 + exposure * 0.15}) contrast(${1 + contrast * 0.02}) saturate(${saturation / 100})`,
    transition: 'transform 0.05s ease-out',
  };

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

      {/* Program Monitor Canvas Viewport (True Black with Real Media Display) */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden p-1">
        {activeClip ? (
          mediaUrl ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                style={visualStyle}
                className="max-w-full max-h-full object-contain pointer-events-none"
                playsInline
                muted
              />
            ) : (
              <img
                src={mediaUrl}
                alt={activeClip.title}
                style={visualStyle}
                className="max-w-full max-h-full object-contain select-none shadow-lg"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-4 bg-[#141414] border border-[#2d2d2d] rounded text-center">
              <span className="material-symbols-outlined text-[32px] text-[#888888] mb-1">
                image
              </span>
              <span className="font-mono text-white text-[12px]">{activeClip.title}</span>
            </div>
          )
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center" />
        )}

        {/* Safe Margins Overlay */}
        {isSafeMarginsActive && (
          <div className="absolute inset-4 border border-white/30 pointer-events-none flex items-center justify-center">
            <div className="w-[90%] h-[90%] border border-white/20" />
          </div>
        )}
      </div>

      {/* Authentic Premiere Pro Transport Controls Bar */}
      <div className="flex items-center justify-between px-3 h-8 bg-[#222222] border-t border-[#303030] text-[#a0a0a0]">
        {/* Left Timecode */}
        <span className="font-mono text-[11px] text-[#e1e1e1]">
          {secondsToSMPTE(currentTime, frameRate)}
        </span>

        {/* Center Transport Controls ({, }, |<, <, >, >|, Loop, +) */}
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
            className="hover:text-white text-[12px] px-1.5 py-0.5 rounded hover:bg-[#333333] transition-colors"
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

          {/* Loop Playback 🔁 */}
          <button
            onClick={toggleLooping}
            className={`text-[12px] px-1 transition-colors ${
              isLooping ? 'text-[#1473e6] font-bold' : 'text-[#888888] hover:text-white'
            }`}
            title={`Loop Playback (Ctrl+L): ${isLooping ? 'ON' : 'OFF'}`}
          >
            🔁
          </button>

          {/* Button Editor + */}
          <button
            className="hover:text-white text-[12px] font-bold px-1"
            title="Button Editor"
          >
            +
          </button>
        </div>

        {/* Right Timecode (End of sequence) */}
        <span className="font-mono text-[11px] text-[#888888]">
          {secondsToSMPTE(sequenceEnd, frameRate)}
        </span>
      </div>
    </div>
  );
};
