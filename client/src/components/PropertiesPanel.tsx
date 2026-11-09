import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { InspectorHub } from './InspectorHub';

export const PropertiesPanel: React.FC = () => {
  const { selectedClipId, clips, showToastBanner } = useTimelineStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'inspector'>('inspector');

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  return (
    <div className="flex flex-col h-full bg-[#131313] border-l border-nle-border text-xs select-none overflow-hidden">
      {/* Header with Properties ≡ and Inspector Tabs */}
      <div className="flex items-center justify-between px-2.5 h-8 bg-nle-header border-b border-nle-border">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('properties')}
            className={`font-semibold text-[11px] px-1 py-0.5 rounded transition-colors ${
              activeTab === 'properties' ? 'text-white' : 'text-nle-dim hover:text-white'
            }`}
          >
            Properties
          </button>
          <span className="text-nle-dim text-[11px] font-mono leading-none">≡</span>

          <div className="w-[1px] h-3 bg-nle-border mx-1" />

          <button
            onClick={() => setActiveTab('inspector')}
            className={`font-semibold text-[11px] px-1 py-0.5 rounded transition-colors ${
              activeTab === 'inspector' ? 'text-nle-accent' : 'text-nle-dim hover:text-white'
            }`}
          >
            AI Hub & Color
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'inspector' ? (
          <InspectorHub />
        ) : (
          <div className="h-full overflow-y-auto p-4 flex flex-col justify-between">
            {selectedClip ? (
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-nle-border">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[12px] truncate max-w-[220px]">
                      {selectedClip.title}
                    </span>
                    <span className="text-3xs font-mono text-nle-dim uppercase">
                      Track: {selectedClip.trackId.toUpperCase()} • {selectedClip.type}
                    </span>
                  </div>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedClip.color }}
                  />
                </div>

                {/* Transform Properties */}
                <div className="flex flex-col gap-2 bg-[#18181b] p-3 rounded-lg border border-nle-border">
                  <span className="text-3xs font-mono uppercase tracking-wider text-nle-accent font-bold">
                    Motion & Transform
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-3xs font-mono text-nle-dim">
                    <div className="flex flex-col">
                      <span>Position</span>
                      <span className="text-white font-semibold">1920.0, 1080.0</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Scale</span>
                      <span className="text-white font-semibold">100.0%</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Rotation</span>
                      <span className="text-white font-semibold">0.0°</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Opacity</span>
                      <span className="text-white font-semibold">100.0%</span>
                    </div>
                  </div>
                </div>

                {/* Time & Duration */}
                <div className="flex flex-col gap-2 bg-[#18181b] p-3 rounded-lg border border-nle-border">
                  <span className="text-3xs font-mono uppercase tracking-wider text-nle-dim font-bold">
                    Timing & Retiming
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-3xs font-mono text-nle-dim">
                    <div className="flex flex-col">
                      <span>Start Time</span>
                      <span className="text-white">{selectedClip.startTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Duration</span>
                      <span className="text-white">{selectedClip.duration.toFixed(2)}s</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Speed</span>
                      <span className="text-nle-emerald font-semibold">{selectedClip.speed}x (Optical Flow)</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Volume</span>
                      <span className="text-white">{selectedClip.volumeDb} dB</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-nle-dim">
                <span className="material-symbols-outlined text-[36px] opacity-40 mb-2">
                  crop_original
                </span>
                <span className="font-bold text-white text-[12px] mb-1">No clip selected</span>
                <span className="text-3xs text-nle-dim max-w-[200px] leading-relaxed">
                  Select a clip in the timeline or double-click an asset to view and adjust its properties.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
