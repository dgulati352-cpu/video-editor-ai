import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { secondsToSMPTE } from '../utils/timecode';
import { InspectorHub } from './InspectorHub';

export const PropertiesPanel: React.FC = () => {
  const {
    selectedClipId,
    selectClip,
    clips,
    duration,
    frameRate,
    resolution,
    updateClipTransform,
    updateClipColorAdjust,
    setTrackVolume,
    deleteSelectedClip,
    splitClipAtPlayhead,
    quickAutoColorMatch,
    quickVoiceIsolation,
    quickSocialReframe,
    quickAutoSubtitles,
    openRenderProgressModal,
    showToastBanner,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'properties' | 'inspector'>('properties');
  const [motionOpen, setMotionOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [volumeOpen, setVolumeOpen] = useState(true);

  // Current selected clip (or null)
  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const sequenceEnd =
    clips.length > 0 ? Math.max(...clips.map((c) => c.startTime + c.duration)) : duration;

  // Active transform / color values with defaults
  const posX = selectedClip?.transform?.positionX ?? 0;
  const posY = selectedClip?.transform?.positionY ?? 0;
  const scale = selectedClip?.transform?.scale ?? 100;
  const rotation = selectedClip?.transform?.rotation ?? 0;
  const opacity = selectedClip?.transform?.opacity ?? 100;

  const exposure = selectedClip?.colorAdjust?.exposure ?? 0;
  const contrast = selectedClip?.colorAdjust?.contrast ?? 0;
  const saturation = selectedClip?.colorAdjust?.saturation ?? 100;

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
              activeTab === 'inspector'
                ? 'text-[#1473e6] font-semibold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            AI & Lumetri
          </button>
        </div>

        {selectedClip && (
          <button
            onClick={() => selectClip(null)}
            className="text-[10px] text-[#888888] hover:text-white px-1"
            title="Deselect Clip"
          >
            ✕
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'inspector' ? (
          <InspectorHub />
        ) : selectedClip ? (
          /* Selected Clip Properties (Interactive Premiere Pro Controls) */
          <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
            {/* Header: Title & Track Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d2d]">
              <div className="flex flex-col truncate pr-2">
                <span className="font-semibold text-white text-[12px] truncate">
                  {selectedClip.title}
                </span>
                <span className="text-[10px] text-[#888888] font-mono uppercase">
                  Track {selectedClip.trackId.toUpperCase()} • {selectedClip.type}
                </span>
              </div>
              <span
                className="w-3.5 h-3.5 rounded-[2px] shrink-0 border border-white/20"
                style={{ backgroundColor: selectedClip.color || '#1473e6' }}
              />
            </div>

            {/* 1. Motion Accordion (Position, Scale, Rotation, Opacity) */}
            <div className="flex flex-col bg-[#252525] rounded-[3px] border border-[#333333] overflow-hidden">
              <button
                onClick={() => setMotionOpen(!motionOpen)}
                className="flex items-center justify-between px-2.5 py-1.5 bg-[#2a2a2a] hover:bg-[#303030] transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d0d0d0] flex items-center gap-1.5">
                  <span className="text-[9px] text-[#888888]">{motionOpen ? '▼' : '▶'}</span>
                  Motion & Transform
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    updateClipTransform(selectedClip.id, {
                      positionX: 0,
                      positionY: 0,
                      scale: 100,
                      rotation: 0,
                      opacity: 100,
                    });
                    showToastBanner('Reset Transform to Default');
                  }}
                  className="text-[9px] text-[#888888] hover:text-white underline cursor-pointer"
                >
                  Reset
                </span>
              </button>

              {motionOpen && (
                <div className="p-2.5 flex flex-col gap-2.5">
                  {/* Position X / Y */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                      <span>Position (X, Y)</span>
                      <span className="font-mono text-white">
                        {posX.toFixed(0)}, {posY.toFixed(0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1 bg-[#1a1a1a] px-1.5 py-1 rounded border border-[#383838]">
                        <span className="text-[9px] text-[#888888] font-mono">X:</span>
                        <input
                          type="range"
                          min="-400"
                          max="400"
                          value={posX}
                          onChange={(e) =>
                            updateClipTransform(selectedClip.id, { positionX: Number(e.target.value) })
                          }
                          className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-[#1a1a1a] px-1.5 py-1 rounded border border-[#383838]">
                        <span className="text-[9px] text-[#888888] font-mono">Y:</span>
                        <input
                          type="range"
                          min="-400"
                          max="400"
                          value={posY}
                          onChange={(e) =>
                            updateClipTransform(selectedClip.id, { positionY: Number(e.target.value) })
                          }
                          className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scale */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                      <span>Scale</span>
                      <span className="font-mono text-white">{scale.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="20"
                        max="250"
                        value={scale}
                        onChange={(e) =>
                          updateClipTransform(selectedClip.id, { scale: Number(e.target.value) })
                        }
                        className="flex-1 h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                      />
                      <button
                        onClick={() => updateClipTransform(selectedClip.id, { scale: 100 })}
                        className="text-[9px] text-[#888888] hover:text-white font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#383838]"
                      >
                        100%
                      </button>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                      <span>Rotation</span>
                      <span className="font-mono text-white">{rotation.toFixed(0)}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) =>
                        updateClipTransform(selectedClip.id, { rotation: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                      <span>Opacity</span>
                      <span className="font-mono text-white">{opacity.toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) =>
                        updateClipTransform(selectedClip.id, { opacity: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Lumetri Basic Color Adjustments */}
            <div className="flex flex-col bg-[#252525] rounded-[3px] border border-[#333333] overflow-hidden">
              <button
                onClick={() => setColorOpen(!colorOpen)}
                className="flex items-center justify-between px-2.5 py-1.5 bg-[#2a2a2a] hover:bg-[#303030] transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d0d0d0] flex items-center gap-1.5">
                  <span className="text-[9px] text-[#888888]">{colorOpen ? '▼' : '▶'}</span>
                  Basic Color & Lumetri
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    updateClipColorAdjust(selectedClip.id, {
                      exposure: 0,
                      contrast: 0,
                      saturation: 100,
                    });
                    showToastBanner('Reset Color to Neutral');
                  }}
                  className="text-[9px] text-[#888888] hover:text-white underline cursor-pointer"
                >
                  Reset
                </span>
              </button>

              {colorOpen && (
                <div className="p-2.5 flex flex-col gap-2.5">
                  {/* Exposure */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                      <span>Exposure</span>
                      <span className="font-mono text-white">
                        {exposure > 0 ? `+${exposure.toFixed(1)}` : exposure.toFixed(1)} EV
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-3"
                      max="3"
                      step="0.1"
                      value={exposure}
                      onChange={(e) =>
                        updateClipColorAdjust(selectedClip.id, { exposure: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                      <span>Contrast</span>
                      <span className="font-mono text-white">
                        {contrast > 0 ? `+${contrast.toFixed(0)}` : contrast.toFixed(0)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={contrast}
                      onChange={(e) =>
                        updateClipColorAdjust(selectedClip.id, { contrast: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                      <span>Saturation</span>
                      <span className="font-mono text-white">{saturation.toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) =>
                        updateClipColorAdjust(selectedClip.id, { saturation: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Audio Volume (If not pure image) */}
            <div className="flex flex-col bg-[#252525] rounded-[3px] border border-[#333333] overflow-hidden">
              <button
                onClick={() => setVolumeOpen(!volumeOpen)}
                className="flex items-center justify-between px-2.5 py-1.5 bg-[#2a2a2a] hover:bg-[#303030] transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d0d0d0] flex items-center gap-1.5">
                  <span className="text-[9px] text-[#888888]">{volumeOpen ? '▼' : '▶'}</span>
                  Audio & Volume
                </span>
                <span className="text-[9px] text-[#888888] font-mono">
                  {selectedClip.volumeDb || 0} dB
                </span>
              </button>

              {volumeOpen && (
                <div className="p-2.5 flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                    <span>Track Level</span>
                    <span className="font-mono text-white">{selectedClip.volumeDb || 0} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="12"
                    value={selectedClip.volumeDb || 0}
                    onChange={(e) => setTrackVolume(selectedClip.trackId, Number(e.target.value))}
                    className="w-full h-1 bg-[#333333] appearance-none accent-[#1473e6] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* 4. Clip Timing & Quick Actions */}
            <div className="flex flex-col gap-2 bg-[#252525] p-2.5 rounded-[3px] border border-[#333333]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">
                Timing & Split
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#888888]">
                <div className="flex flex-col bg-[#1a1a1a] p-1.5 rounded border border-[#333333]">
                  <span>Timeline In:</span>
                  <span className="text-white font-medium">
                    {secondsToSMPTE(selectedClip.startTime, frameRate)}
                  </span>
                </div>
                <div className="flex flex-col bg-[#1a1a1a] p-1.5 rounded border border-[#333333]">
                  <span>Duration:</span>
                  <span className="text-white font-medium">
                    {selectedClip.duration.toFixed(2)}s
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={splitClipAtPlayhead}
                  className="flex-1 py-1 rounded bg-[#2e2e2e] hover:bg-[#383838] text-white text-[10px] font-medium flex items-center justify-center gap-1 border border-[#404040]"
                >
                  <span className="material-symbols-outlined text-[12px]">content_cut</span>
                  Split at Playhead (Ctrl+K)
                </button>
                <button
                  onClick={deleteSelectedClip}
                  className="py-1 px-2.5 rounded bg-[#4d1414] hover:bg-[#6b1c1c] text-[#ff8080] text-[10px] font-medium flex items-center justify-center gap-1 border border-[#7a2020]"
                  title="Delete Clip (Del)"
                >
                  <span className="material-symbols-outlined text-[12px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ) : clips.length > 0 ? (
          /* Sequence Properties (When no single clip is selected) */
          <div className="h-full overflow-y-auto p-3 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#2d2d2d]">
              <span className="material-symbols-outlined text-[18px] text-[#1473e6]">
                movie_filter
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-[12px]">Sequence 01</span>
                <span className="text-[10px] text-[#888888] font-mono">
                  {resolution} • {frameRate}.00 fps
                </span>
              </div>
            </div>

            {/* Sequence Metrics */}
            <div className="bg-[#252525] p-2.5 rounded-[3px] border border-[#333333] flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">
                Sequence Information
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#888888]">
                <div className="flex flex-col">
                  <span>Duration:</span>
                  <span className="text-white font-medium">
                    {secondsToSMPTE(sequenceEnd, frameRate)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span>Clips:</span>
                  <span className="text-white font-medium">{clips.length} item(s)</span>
                </div>
                <div className="flex flex-col">
                  <span>Audio Spec:</span>
                  <span className="text-white font-medium">48000 Hz Stereo</span>
                </div>
                <div className="flex flex-col">
                  <span>Aspect Ratio:</span>
                  <span className="text-white font-medium">16:9 Square</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Premiere Pro AI Tools) */}
            <div className="bg-[#252525] p-2.5 rounded-[3px] border border-[#333333] flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">
                Sequence AI Actions
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={quickAutoColorMatch}
                  className="w-full py-1.5 px-2 bg-[#2a2a2a] hover:bg-[#333333] rounded text-left text-[11px] text-white flex items-center justify-between border border-[#3a3a3a]"
                >
                  <span>🎨 Auto Color Match</span>
                  <span className="text-[9px] text-[#888888] font-mono">ACEScg 35mm</span>
                </button>
                <button
                  onClick={quickVoiceIsolation}
                  className="w-full py-1.5 px-2 bg-[#2a2a2a] hover:bg-[#333333] rounded text-left text-[11px] text-white flex items-center justify-between border border-[#3a3a3a]"
                >
                  <span>🎙 AI Voice Isolation</span>
                  <span className="text-[9px] text-[#888888] font-mono">-22 dB</span>
                </button>
                <button
                  onClick={quickAutoSubtitles}
                  className="w-full py-1.5 px-2 bg-[#2a2a2a] hover:bg-[#333333] rounded text-left text-[11px] text-white flex items-center justify-between border border-[#3a3a3a]"
                >
                  <span>💬 Generate Subtitles</span>
                  <span className="text-[9px] text-[#888888] font-mono">CC1 Sync</span>
                </button>
                <button
                  onClick={quickSocialReframe}
                  className="w-full py-1.5 px-2 bg-[#2a2a2a] hover:bg-[#333333] rounded text-left text-[11px] text-white flex items-center justify-between border border-[#3a3a3a]"
                >
                  <span>📱 Social Reframe</span>
                  <span className="text-[9px] text-[#888888] font-mono">16:9 / 9:16</span>
                </button>
                <button
                  onClick={openRenderProgressModal}
                  className="w-full py-1.5 px-2 bg-[#1473e6] hover:bg-[#005fb8] rounded text-center text-[11px] font-semibold text-white mt-1 shadow-sm"
                >
                  Export Sequence (Ctrl+M)
                </button>
              </div>
            </div>

            <span className="text-[10px] text-[#777777] italic text-center mt-auto">
              Tip: Click any clip on timeline to adjust its Motion, Scale, Rotation, and Color.
            </span>
          </div>
        ) : (
          /* Empty State Matching Real Premiere Pro Screenshot */
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="flex items-center gap-1.5 text-[#888888] mb-2">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="font-semibold text-[12px] text-[#a0a0a0]">No sequence</span>
            </div>
            <span className="text-[11px] text-[#777777] max-w-[200px]">
              Drop media into the timeline to create a sequence.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
