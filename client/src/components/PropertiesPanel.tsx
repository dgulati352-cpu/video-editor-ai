import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { InspectorHub } from './InspectorHub';

export const PropertiesPanel: React.FC = () => {
  const { selectedClipId, clips, showToastBanner } = useTimelineStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'inspector'>('properties');

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#303030] text-xs select-none overflow-hidden">
      {/* Header with Properties ≡ */}
      <div className="flex items-center justify-between px-3 h-7 bg-[#252525] border-b border-[#303030]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`font-semibold text-[11px] transition-colors ${
              activeTab === 'properties' ? 'text-white' : 'text-[#888888] hover:text-white'
            }`}
          >
            Properties
          </button>
          <span className="text-[#888888] text-[10px]">≡</span>

          <div className="w-[1px] h-3 bg-[#3a3a3a] mx-1" />

          <button
            onClick={() => setActiveTab('inspector')}
            className={`text-[11px] font-medium transition-colors ${
              activeTab === 'inspector' ? 'text-[#1473e6] font-semibold' : 'text-[#888888] hover:text-white'
            }`}
          >
            AI & Lumetri
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'inspector' ? (
          <InspectorHub />
        ) : selectedClip ? (
          <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d2d]">
              <div className="flex flex-col truncate">
                <span className="font-semibold text-white text-[12px] truncate">
                  {selectedClip.title}
                </span>
                <span className="text-[10px] text-[#888888] font-mono uppercase">
                  {selectedClip.trackId.toUpperCase()} • {selectedClip.type}
                </span>
              </div>
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selectedClip.color || '#1473e6' }}
              />
            </div>

            {/* Transform */}
            <div className="flex flex-col gap-1.5 bg-[#252525] p-2.5 rounded-[3px] border border-[#333333]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a0a0a0]">
                Motion
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#888888]">
                <div className="flex flex-col">
                  <span>Position</span>
                  <span className="text-white font-medium">1920, 1080</span>
                </div>
                <div className="flex flex-col">
                  <span>Scale</span>
                  <span className="text-white font-medium">100.0%</span>
                </div>
                <div className="flex flex-col">
                  <span>Rotation</span>
                  <span className="text-white font-medium">0.0°</span>
                </div>
                <div className="flex flex-col">
                  <span>Opacity</span>
                  <span className="text-white font-medium">100.0%</span>
                </div>
              </div>
            </div>

            {/* Timing */}
            <div className="flex flex-col gap-1.5 bg-[#252525] p-2.5 rounded-[3px] border border-[#333333]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a0a0a0]">
                Time & Duration
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#888888]">
                <div className="flex flex-col">
                  <span>Start</span>
                  <span className="text-white font-medium">{selectedClip.startTime.toFixed(2)}s</span>
                </div>
                <div className="flex flex-col">
                  <span>Duration</span>
                  <span className="text-white font-medium">{selectedClip.duration.toFixed(2)}s</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Matching Real Premiere Pro Screenshot */
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="flex items-center gap-1.5 text-[#888888] mb-2">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="font-semibold text-[12px] text-[#a0a0a0]">No sequence</span>
            </div>
            <span className="text-[11px] text-[#777777] max-w-[200px]">
              Select a clip in the timeline to view properties.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
