import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { secondsToSMPTE } from '../utils/timecode';

export const SourceMonitor: React.FC = () => {
  const { mediaAssets, frameRate, sourceAssetId } = useTimelineStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceTime, setSourceTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeAsset = mediaAssets.find((a) => a.id === sourceAssetId) || mediaAssets[0];
  const isVideo = activeAsset ? activeAsset.type === 'video' || /\.(mp4|mov|webm|mkv|avi)$/i.test(activeAsset.name) : false;
  const mediaUrl = activeAsset?.url || activeAsset?.thumbnail;

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleStep = (delta: number) => {
    const next = Math.max(0, Math.min(activeAsset?.duration || 60, sourceTime + delta / 60));
    setSourceTime(next);
    if (videoRef.current) {
      videoRef.current.currentTime = next;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#303030] text-xs select-none overflow-hidden">
      {/* Tab Header with ≡ Hamburger */}
      <div className="flex items-center justify-between px-3 h-7 bg-[#252525] border-b border-[#303030]">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-[11px] truncate">
            Source: {activeAsset ? activeAsset.name : '(no clips)'}
          </span>
          <span className="text-[#888888] text-[10px]">≡</span>
        </div>
      </div>

      {/* Source Canvas / Preview (True Black with Real Media Display) */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden p-1">
        {activeAsset && mediaUrl ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="max-w-full max-h-full object-contain"
              playsInline
              onTimeUpdate={() => videoRef.current && setSourceTime(videoRef.current.currentTime)}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={activeAsset.name}
              className="max-w-full max-h-full object-contain select-none"
            />
          )
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center text-[#555555] font-mono text-[11px]">
            No Source Clip Selected
          </div>
        )}
      </div>

      {/* Authentic Premiere Pro Source Transport Controls Bar */}
      <div className="flex items-center justify-between px-3 h-8 bg-[#222222] border-t border-[#303030] text-[#a0a0a0]">
        {/* Left Timecode */}
        <span className="font-mono text-[11px] text-[#e1e1e1]">
          {secondsToSMPTE(sourceTime, frameRate)}
        </span>

        {/* Center Transport Controls ({, }, |<, <, >, >|, +) */}
        <div className="flex items-center gap-2">
          {/* Mark In { */}
          <button
            onClick={() => setSourceTime(0)}
            className="hover:text-white text-[12px] font-mono px-1"
            title="Mark In (I)"
          >
            {'{'}
          </button>

          {/* Mark Out } */}
          <button
            onClick={() => activeAsset && setSourceTime(activeAsset.duration)}
            className="hover:text-white text-[12px] font-mono px-1"
            title="Mark Out (O)"
          >
            {'}'}
          </button>

          {/* Go to In |◀ */}
          <button
            onClick={() => {
              setSourceTime(0);
              if (videoRef.current) videoRef.current.currentTime = 0;
            }}
            className="hover:text-white text-[11px] px-1"
            title="Go to In (Shift+I)"
          >
            |◀
          </button>

          {/* Step Back ◀ */}
          <button
            onClick={() => handleStep(-1)}
            className="hover:text-white text-[11px] px-1"
            title="Step Back 1 Frame (Left Arrow)"
          >
            ◀
          </button>

          {/* Play / Pause ▶ */}
          <button
            onClick={handlePlayToggle}
            className="hover:text-white text-[12px] px-1"
            title="Play / Stop (Space)"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Step Forward ▶| */}
          <button
            onClick={() => handleStep(1)}
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
          {activeAsset ? secondsToSMPTE(activeAsset.duration, frameRate) : '00;00;00;00'}
        </span>
      </div>
    </div>
  );
};
