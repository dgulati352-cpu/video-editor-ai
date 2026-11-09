import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { secondsToSMPTE } from '../utils/timecode';

export const SourceMonitor: React.FC = () => {
  const { mediaAssets, insertAssetAtPlayhead, frameRate } = useTimelineStore();
  const [activeAssetId, setActiveAssetId] = useState<string | null>(mediaAssets[0]?.id || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceTime, setSourceTime] = useState(0);

  const activeAsset = mediaAssets.find((a) => a.id === activeAssetId) || mediaAssets[0];

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStep = (delta: number) => {
    setSourceTime((prev) => Math.max(0, Math.min(activeAsset?.duration || 60, prev + delta / 60)));
  };

  return (
    <div className="flex flex-col h-full bg-nle-canvas border-r border-nle-border text-xs select-none">
      {/* Tab Header with ≡ Hamburger */}
      <div className="flex items-center justify-between px-3 h-8 bg-nle-header border-b border-nle-border">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-nle-text text-[11px] truncate">
            Source: {activeAsset ? activeAsset.name : '(no clips)'}
          </span>
          <span className="text-nle-dim text-[11px] font-mono leading-none">≡</span>
        </div>

        {activeAsset && (
          <span className="text-3xs font-mono px-1.5 py-0.2 rounded bg-nle-panel border border-nle-border text-nle-dim">
            {activeAsset.resolution}
          </span>
        )}
      </div>

      {/* Source Canvas / Preview */}
      <div className="relative flex-1 bg-black flex items-center justify-center p-2 overflow-hidden">
        <div className="relative w-full h-full max-h-[460px] aspect-video bg-nle-bg rounded overflow-hidden shadow-xl border border-nle-border/40 flex items-center justify-center">
          {activeAsset?.thumbnail ? (
            <img
              src={activeAsset.thumbnail}
              alt={activeAsset.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-nle-muted">
              <span className="material-symbols-outlined text-[36px] opacity-40">movie</span>
              <span className="font-mono text-3xs mt-1">NO SOURCE MEDIA LOADED</span>
            </div>
          )}

          {/* Timecode Readout Overlay */}
          <div className="absolute top-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded font-mono text-[11px] text-nle-text border border-white/10">
            {secondsToSMPTE(sourceTime, frameRate)}
          </div>
        </div>
      </div>

      {/* Source Transport Bar */}
      <div className="flex items-center justify-between px-2.5 h-9 bg-nle-surface border-t border-nle-border font-mono text-3xs">
        {/* Left: In / Out points */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStep(-1)}
            className="p-1 rounded hover:bg-nle-panel text-nle-dim hover:text-white"
            title="Step Back 1 Frame"
          >
            <span className="material-symbols-outlined text-[15px]">skip_previous</span>
          </button>

          <button
            onClick={handlePlayToggle}
            className="w-6 h-6 rounded-full bg-nle-panel hover:bg-nle-accent hover:text-black text-white flex items-center justify-center transition-colors"
            title="Play / Pause"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={() => handleStep(1)}
            className="p-1 rounded hover:bg-nle-panel text-nle-dim hover:text-white"
            title="Step Forward 1 Frame"
          >
            <span className="material-symbols-outlined text-[15px]">skip_next</span>
          </button>
        </div>

        {/* Center: Source duration */}
        <span className="text-nle-dim">
          Dur: {activeAsset ? `${activeAsset.duration.toFixed(1)}s` : '00;00;00;00'}
        </span>

        {/* Right: Insert / Overwrite buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => activeAsset && insertAssetAtPlayhead(activeAsset.id)}
            className="px-2 py-0.5 rounded bg-nle-accent/20 border border-nle-accent/40 text-nle-accent hover:bg-nle-accent hover:text-black font-semibold transition-all"
            title="Insert into Timeline (,)"
          >
            , Insert
          </button>
          <button
            onClick={() => activeAsset && insertAssetAtPlayhead(activeAsset.id)}
            className="px-2 py-0.5 rounded bg-nle-panel border border-nle-border text-white hover:border-nle-accent transition-colors"
            title="Overwrite into Timeline (.)"
          >
            . Overwrite
          </button>
        </div>
      </div>
    </div>
  );
};
