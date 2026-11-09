import React, { useRef, useState, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { Track, Clip, SilenceCut } from '../types';
import { secondsToSMPTE, formatDuration } from '../utils/timecode';

export const Timeline: React.FC = () => {
  const {
    tracks,
    clips,
    currentTime,
    duration,
    timelineZoom,
    setTimelineZoom,
    setCurrentTime,
    selectedClipId,
    selectClip,
    moveClip,
    activeTool,
    splitClipAtPlayhead,
    deleteSelectedClip,
    inPoint,
    outPoint,
    silenceState,
    toggleMute,
    toggleSolo,
    toggleLock,
    toggleSyncLock,
    audioPeakL,
    audioPeakR,
    snappingEnabled,
    toggleSnapping,
    frameRate,
    showToastBanner,
  } = useTimelineStore();

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [clipOriginalStartTime, setClipOriginalStartTime] = useState<number>(0);

  // Time conversion
  const timeToPixels = (time: number) => time * timelineZoom;
  const pixelsToTime = (px: number) => Math.max(0, px / timelineZoom);

  const updatePlayheadFromMouseEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const mouseX = e.clientX - rect.left + scrollLeft - 140;
    const maxDur = Math.max(30, duration);
    let newTime = Math.max(0, Math.min(maxDur, pixelsToTime(mouseX)));

    if (snappingEnabled) {
      const snapPoints = [
        0,
        inPoint ?? -999,
        outPoint ?? -999,
        ...clips.map((c) => c.startTime),
        ...clips.map((c) => c.startTime + c.duration),
      ];
      const threshold = 8 / timelineZoom;
      for (const sp of snapPoints) {
        if (Math.abs(newTime - sp) < threshold) {
          newTime = sp;
          break;
        }
      }
    }

    setCurrentTime(newTime);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updatePlayheadFromMouseEvent(e);
      } else if (draggingClipId) {
        const deltaPx = e.clientX - dragStartX;
        const deltaTime = pixelsToTime(deltaPx);
        const newStartTime = Math.max(0, clipOriginalStartTime + deltaTime);
        moveClip(draggingClipId, newStartTime);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClipId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, draggingClipId, dragStartX, clipOriginalStartTime, timelineZoom]);

  const handleClipMouseDown = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    selectClip(clip.id);

    if (activeTool === 'razor_cut') {
      splitClipAtPlayhead();
      return;
    }

    setDraggingClipId(clip.id);
    setDragStartX(e.clientX);
    setClipOriginalStartTime(clip.startTime);
  };

  const hasClips = clips.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#181818] text-xs select-none overflow-hidden">
      {/* Top Tab Bar: x Timeline: Sequence 01 ≡ */}
      <div className="flex items-center justify-between px-2 h-7 bg-[#252525] border-b border-[#303030]">
        <div className="flex items-center gap-1.5">
          <button
            className="text-[#888888] hover:text-white text-[11px] leading-none px-1"
            title="Close Timeline"
          >
            ✕
          </button>
          <span className="font-semibold text-white text-[11px]">
            {hasClips ? 'Timeline: Sequence 01' : 'Timeline: (no sequences)'}
          </span>
          <span className="text-[#888888] text-[10px]">≡</span>
        </div>
      </div>

      {/* Subheader: Timecode & Magnet / Link / Markers / Settings Icons */}
      <div className="h-7 bg-[#222222] border-b border-[#2d2d2d] px-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Blue SMPTE Timecode (Premiere Pro style) */}
          <span className="font-mono text-[11px] font-semibold text-[#1473e6] tracking-wider">
            {secondsToSMPTE(currentTime, frameRate)}
          </span>

          <div className="h-3 w-[1px] bg-[#353535]" />

          {/* Snap Magnet Icon */}
          <button
            onClick={toggleSnapping}
            className={`p-1 rounded ${
              snappingEnabled ? 'text-[#1473e6]' : 'text-[#888888] hover:text-white'
            }`}
            title="Snap in Timeline (S)"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M3 7v6a9 9 0 0 0 18 0V7h-4v6a5 5 0 0 1-10 0V7H3zm0-4h4v3H3V3zm14 0h4v3h-4V3z" />
            </svg>
          </button>

          {/* Linked Selection Icon */}
          <button
            className="p-1 rounded text-[#1473e6]"
            title="Linked Selection"
          >
            <span className="material-symbols-outlined text-[15px]">link</span>
          </button>

          {/* Add Marker Icon */}
          <button
            onClick={() => showToastBanner(`Marker added at ${secondsToSMPTE(currentTime, frameRate)}`)}
            className="p-1 rounded text-[#888888] hover:text-white"
            title="Add Marker (M)"
          >
            <span className="material-symbols-outlined text-[15px]">bookmark</span>
          </button>

          {/* Wrench Settings Icon */}
          <button
            className="p-1 rounded text-[#888888] hover:text-white"
            title="Timeline Display Settings"
          >
            <span className="material-symbols-outlined text-[15px]">build</span>
          </button>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#888888]">Zoom</span>
          <input
            type="range"
            min="20"
            max="120"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(Number(e.target.value))}
            className="w-20 h-1 bg-[#353535] rounded appearance-none accent-[#1473e6] cursor-pointer"
          />
        </div>
      </div>

      {/* Main Timeline Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {!hasClips ? (
          /* Empty Sequence State Matching Real Premiere Pro Screenshot */
          <div className="flex-1 h-full flex items-center justify-center bg-[#181818] text-[#777777] text-[12px]">
            Drop media here to create a sequence.
          </div>
        ) : (
          /* Scrollable Timeline Area */
          <div
            ref={timelineContainerRef}
            className="flex-1 overflow-x-auto overflow-y-auto relative flex bg-[#141414]"
          >
            {/* Track Headers Column (Fixed 140px width) */}
            <div className="w-36 sticky left-0 z-20 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col shrink-0">
              {/* Top Ruler Placeholder */}
              <div className="h-6 bg-[#222222] border-b border-[#2d2d2d] px-2 flex items-center text-[10px] text-[#888888]">
                <span>TRACKS</span>
              </div>

              {/* Track Headers */}
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-12 border-b border-[#282828] flex items-center justify-between px-2 bg-[#202020] hover:bg-[#252525] transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-1.5 h-4 rounded-[1px] shrink-0"
                      style={{ backgroundColor: track.color || '#1473e6' }}
                    />
                    <span className="font-medium text-[11px] text-[#e1e1e1] truncate" title={track.name}>
                      {track.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleMute(track.id)}
                      className={`w-4 h-4 rounded-[2px] text-[9px] font-bold flex items-center justify-center ${
                        track.isMuted
                          ? 'bg-[#e81123] text-white'
                          : 'bg-[#2a2a2a] text-[#888888] hover:text-white'
                      }`}
                      title="Mute Track"
                    >
                      M
                    </button>
                    <button
                      onClick={() => toggleSolo(track.id)}
                      className={`w-4 h-4 rounded-[2px] text-[9px] font-bold flex items-center justify-center ${
                        track.isSolo
                          ? 'bg-[#107c41] text-white'
                          : 'bg-[#2a2a2a] text-[#888888] hover:text-white'
                      }`}
                      title="Solo Track"
                    >
                      S
                    </button>
                    <button
                      onClick={() => toggleLock(track.id)}
                      className={`w-4 h-4 rounded-[2px] text-[9px] flex items-center justify-center ${
                        track.isLocked
                          ? 'bg-[#d83b01] text-white'
                          : 'bg-[#2a2a2a] text-[#888888] hover:text-white'
                      }`}
                      title="Lock Track"
                    >
                      <span className="material-symbols-outlined text-[10px]">lock</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Ruler and Tracks Canvas */}
            <div
              className="relative flex flex-col flex-1"
              style={{ width: `${Math.max(1200, timeToPixels(duration))}px` }}
            >
              {/* Ruler Bar */}
              <div
                onMouseDown={(e) => {
                  setIsScrubbing(true);
                  updatePlayheadFromMouseEvent(e);
                }}
                className="h-6 bg-[#222222] border-b border-[#2d2d2d] relative cursor-pointer"
              >
                {Array.from({ length: Math.ceil(duration / 2) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-[#353535] text-[9px] font-mono text-[#777777] pl-1 pt-0.5"
                    style={{ left: `${timeToPixels(i * 2)}px` }}
                  >
                    {secondsToSMPTE(i * 2, frameRate)}
                  </div>
                ))}
              </div>

              {/* Tracks Lanes */}
              {tracks.map((track) => {
                const trackClips = clips.filter((c) => c.trackId === track.id);
                return (
                  <div
                    key={track.id}
                    className="h-12 border-b border-[#242424] relative bg-[#181818]"
                  >
                    {trackClips.map((clip) => {
                      const isSelected = selectedClipId === clip.id;
                      const leftPx = timeToPixels(clip.startTime);
                      const widthPx = timeToPixels(clip.duration);

                      return (
                        <div
                          key={clip.id}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                          className={`absolute top-1 bottom-1 rounded-[2px] px-1.5 flex items-center overflow-hidden cursor-move transition-shadow ${
                            isSelected
                              ? 'border-2 border-white shadow-md'
                              : 'border border-black/40'
                          }`}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                            backgroundColor: clip.color || '#1473e6',
                          }}
                        >
                          {clip.mediaUrl && (
                            <img
                              src={clip.mediaUrl}
                              alt=""
                              className="w-5 h-5 rounded-[1px] object-cover mr-1 shrink-0 pointer-events-none"
                            />
                          )}
                          <span className="font-semibold text-white text-[10px] truncate drop-shadow-sm">
                            {clip.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Playhead Line */}
              <div
                className="absolute top-0 bottom-0 w-[1px] bg-[#1473e6] pointer-events-none z-30"
                style={{
                  left: `${timeToPixels(currentTime)}px`,
                  height: `${tracks.length * 48 + 24}px`,
                }}
              >
                <div className="w-2.5 h-2.5 -ml-[5px] bg-[#1473e6] rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* Right Audio Meters (Matching Real Premiere Pro Screenshot) */}
        <div className="w-10 bg-[#1e1e1e] border-l border-[#2d2d2d] flex flex-col items-center py-2 shrink-0 select-none">
          <div className="flex-1 w-5 bg-black border border-[#333333] flex justify-center gap-0.5 p-0.5 relative">
            {/* Left Channel */}
            <div className="flex-1 bg-[#1a1a1a] flex flex-col justify-end">
              <div
                className="w-full bg-gradient-to-t from-[#107c41] via-[#ffb900] to-[#e81123]"
                style={{
                  height: `${Math.max(4, Math.min(100, ((audioPeakL + 60) / 60) * 100))}%`,
                }}
              />
            </div>

            {/* Right Channel */}
            <div className="flex-1 bg-[#1a1a1a] flex flex-col justify-end">
              <div
                className="w-full bg-gradient-to-t from-[#107c41] via-[#ffb900] to-[#e81123]"
                style={{
                  height: `${Math.max(4, Math.min(100, ((audioPeakR + 60) / 60) * 100))}%`,
                }}
              />
            </div>

            {/* Decibel tick markings */}
            <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-between text-[7px] font-mono text-[#777777] pointer-events-none">
              <span>0</span>
              <span>-6</span>
              <span>-12</span>
              <span>-24</span>
              <span>-48</span>
              <span>-∞</span>
            </div>
          </div>

          <span className="text-[8px] font-mono text-[#888888] mt-1">dB</span>
        </div>
      </div>
    </div>
  );
};
