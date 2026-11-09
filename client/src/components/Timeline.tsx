import React, { useRef, useState, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { Track, Clip } from '../types';
import { secondsToSMPTE } from '../utils/timecode';

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
    splitClipAt,
    updateClipDuration,
    insertAssetAtTrackAndTime,
    addTitleClip,
    inPoint,
    outPoint,
    toggleMute,
    toggleSolo,
    toggleLock,
    audioPeakL,
    audioPeakR,
    snappingEnabled,
    toggleSnapping,
    frameRate,
    showToastBanner,
  } = useTimelineStore();

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Moving clips
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [clipOriginalStartTime, setClipOriginalStartTime] = useState<number>(0);

  // Trimming clips (Left / Right edge drag)
  const [trimmingClipId, setTrimmingClipId] = useState<string | null>(null);
  const [trimEdge, setTrimEdge] = useState<'left' | 'right' | null>(null);
  const [trimStartX, setTrimStartX] = useState<number>(0);
  const [trimOrigStart, setTrimOrigStart] = useState<number>(0);
  const [trimOrigDur, setTrimOrigDur] = useState<number>(0);

  // Time conversion
  const timeToPixels = (time: number) => time * timelineZoom;
  const pixelsToTime = (px: number) => Math.max(0, px / timelineZoom);

  // Exact end of the video or photo footage
  const sequenceEnd =
    clips.length > 0 ? Math.max(...clips.map((c) => c.startTime + c.duration)) : duration;

  const updatePlayheadFromMouseEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const mouseX = e.clientX - rect.left + scrollLeft - 144;
    const maxDur = sequenceEnd > 0 ? sequenceEnd : Math.max(30, duration);
    let newTime = Math.max(0, Math.min(maxDur, pixelsToTime(mouseX)));

    if (snappingEnabled) {
      const snapPoints = [
        0,
        sequenceEnd,
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

  // Mouse move / up listeners for dragging & trimming
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updatePlayheadFromMouseEvent(e);
      } else if (trimmingClipId && trimEdge) {
        // Trimming clip left or right edge
        const deltaPx = e.clientX - trimStartX;
        const deltaTime = pixelsToTime(deltaPx);

        if (trimEdge === 'right') {
          const newDur = Math.max(0.2, trimOrigDur + deltaTime);
          updateClipDuration(trimmingClipId, newDur);
        } else if (trimEdge === 'left') {
          const newStart = Math.max(0, trimOrigStart + deltaTime);
          const newDur = Math.max(0.2, trimOrigDur - deltaTime);
          updateClipDuration(trimmingClipId, newDur, newStart);
        }
      } else if (draggingClipId) {
        // Moving clip
        const deltaPx = e.clientX - dragStartX;
        const deltaTime = pixelsToTime(deltaPx);
        const newStartTime = Math.max(0, clipOriginalStartTime + deltaTime);
        moveClip(draggingClipId, newStartTime);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClipId(null);
      setTrimmingClipId(null);
      setTrimEdge(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbing,
    draggingClipId,
    dragStartX,
    clipOriginalStartTime,
    trimmingClipId,
    trimEdge,
    trimStartX,
    trimOrigStart,
    trimOrigDur,
    timelineZoom,
  ]);

  // Click on clip (Razor split or Select & Move)
  const handleClipMouseDown = (e: React.MouseEvent<HTMLDivElement>, clip: Clip) => {
    e.stopPropagation();
    selectClip(clip.id);

    // Razor Tool active: split right at mouse cursor timestamp
    if (activeTool === 'razor_cut') {
      const clipRect = e.currentTarget.getBoundingClientRect();
      const clickOffsetPx = e.clientX - clipRect.left;
      const clickTime = clip.startTime + pixelsToTime(clickOffsetPx);
      splitClipAt(clip.id, clickTime);
      return;
    }

    setDraggingClipId(clip.id);
    setDragStartX(e.clientX);
    setClipOriginalStartTime(clip.startTime);
  };

  // Trim handle start
  const handleTrimStart = (
    e: React.MouseEvent,
    clip: Clip,
    edge: 'left' | 'right'
  ) => {
    e.stopPropagation();
    selectClip(clip.id);
    setTrimmingClipId(clip.id);
    setTrimEdge(edge);
    setTrimStartX(e.clientX);
    setTrimOrigStart(clip.startTime);
    setTrimOrigDur(clip.duration);
  };

  // Drop media asset directly from Project Bin onto specific track
  const handleTrackDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('text/plain');
    if (!assetId || !timelineContainerRef.current) return;

    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const mouseX = e.clientX - rect.left + scrollLeft - 144;
    const dropTime = Math.max(0, pixelsToTime(mouseX));

    insertAssetAtTrackAndTime(assetId, trackId, dropTime);
  };

  const hasClips = clips.length > 0;
  const canvasWidth = Math.max(
    1400,
    timeToPixels(Math.max(sequenceEnd + 15, 60))
  );

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

          {/* Horseshoe Magnet Snap Tool Icon */}
          <button
            onClick={toggleSnapping}
            className={`p-1 rounded transition-colors ${
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
            max="140"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(Number(e.target.value))}
            className="w-24 h-1 bg-[#353535] rounded appearance-none accent-[#1473e6] cursor-pointer"
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
            {/* Track Headers Column (Fixed 144px width) */}
            <div className="w-36 sticky left-0 z-20 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col shrink-0">
              {/* Top Ruler Placeholder */}
              <div className="h-6 bg-[#222222] border-b border-[#2d2d2d] px-2 flex items-center text-[10px] text-[#888888]">
                <span>TRACKS</span>
              </div>

              {/* Track List Headers */}
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-12 border-b border-[#2d2d2d] px-2 flex items-center justify-between bg-[#1f1f1f]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`font-semibold text-[10px] font-mono ${
                        track.type === 'video'
                          ? 'text-[#00e5ff]'
                          : track.type === 'subtitle'
                          ? 'text-[#eab308]'
                          : 'text-[#10b981]'
                      }`}
                    >
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

            {/* Time Ruler and Continuous Tracks Canvas (100% Authentic Adobe Premiere Pro Look) */}
            <div
              className="relative flex flex-col flex-1"
              style={{ width: `${canvasWidth}px` }}
            >
              {/* Ruler Bar */}
              <div
                onMouseDown={(e) => {
                  setIsScrubbing(true);
                  updatePlayheadFromMouseEvent(e);
                }}
                className="h-6 bg-[#222222] border-b border-[#2d2d2d] relative cursor-pointer"
              >
                {Array.from({
                  length: Math.ceil(canvasWidth / (timelineZoom * 2)),
                }).map((_, i) => (
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
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={(e) => handleTrackDrop(e, track.id)}
                    className="h-12 border-b border-[#242424] relative bg-[#181818] hover:bg-[#1a1a1a] transition-colors"
                  >
                    {trackClips.map((clip) => {
                      const isSelected = selectedClipId === clip.id;
                      const leftPx = timeToPixels(clip.startTime);
                      const widthPx = timeToPixels(clip.duration);

                      return (
                        <div
                          key={clip.id}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                          className={`group absolute top-1 bottom-1 rounded-[2px] px-1.5 flex items-center overflow-hidden transition-shadow select-none ${
                            activeTool === 'razor_cut'
                              ? 'cursor-crosshair'
                              : 'cursor-move'
                          } ${
                            isSelected
                              ? 'border-2 border-white shadow-lg z-10'
                              : 'border border-black/40 hover:border-white/50'
                          }`}
                          style={{
                            left: `${leftPx}px`,
                            width: `${Math.max(16, widthPx)}px`,
                            backgroundColor: clip.color || '#1473e6',
                          }}
                        >
                          {/* Left Trim Handle */}
                          <div
                            onMouseDown={(e) => handleTrimStart(e, clip, 'left')}
                            className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/50 cursor-ew-resize z-20"
                            title="Trim In Point"
                          />

                          {/* Media Thumbnail & FX badge */}
                          {clip.mediaUrl ? (
                            <img
                              src={clip.mediaUrl}
                              alt=""
                              className="w-5 h-5 rounded-[1px] object-cover mr-1.5 shrink-0 pointer-events-none"
                            />
                          ) : (
                            <span className="px-1 py-0.2 rounded-[1px] bg-[#222222] text-[8px] text-[#00ff88] font-bold border border-[#333333] mr-1 shrink-0 pointer-events-none">
                              fx
                            </span>
                          )}

                          {/* Clip Title */}
                          <span className="font-semibold text-white text-[10px] truncate drop-shadow-sm pointer-events-none">
                            {clip.title}
                          </span>

                          {/* Right Trim Handle */}
                          <div
                            onMouseDown={(e) => handleTrimStart(e, clip, 'right')}
                            className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/50 cursor-ew-resize z-20"
                            title="Trim Out Point"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Clean Premiere Pro Sequence End Marker */}
              {sequenceEnd > 0 && (
                <div
                  className="absolute top-0 pointer-events-none z-20 border-l border-[#1473e6]/80 flex flex-col items-start"
                  style={{
                    left: `${timeToPixels(sequenceEnd)}px`,
                    height: `${tracks.length * 48 + 24}px`,
                  }}
                >
                  <div className="bg-[#1473e6] text-white text-[8px] font-mono px-1 py-0.5 rounded-br tracking-wider uppercase font-semibold flex items-center gap-1 shadow-sm">
                    <span>END</span>
                    <span>{secondsToSMPTE(sequenceEnd, frameRate)}</span>
                  </div>
                </div>
              )}

              {/* Playhead Line with Authentic Inverted Pentagon Blue Head */}
              <div
                className="absolute top-0 bottom-0 w-[1px] bg-[#1473e6] pointer-events-none z-30"
                style={{
                  left: `${timeToPixels(currentTime)}px`,
                  height: `${tracks.length * 48 + 24}px`,
                }}
              >
                <div className="w-2.5 h-2.5 -ml-[5px] bg-[#1473e6] rotate-45 shadow-md" />
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
