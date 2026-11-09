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
    setTrackVolume,
    audioPeakL,
    audioPeakR,
    snappingEnabled,
    toggleSnapping,
    showToastBanner,
  } = useTimelineStore();

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [clipOriginalStartTime, setClipOriginalStartTime] = useState<number>(0);
  const [rulerHoverTime, setRulerHoverTime] = useState<number | null>(null);
  const [snapLineX, setSnapLineX] = useState<number | null>(null);

  // Time conversion
  const timeToPixels = (time: number) => time * timelineZoom;
  const pixelsToTime = (px: number) => Math.max(0, px / timelineZoom);

  // Ruler scrub handling
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updatePlayheadFromMouseEvent(e);
  };

  const handleRulerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const mouseX = e.clientX - rect.left + scrollLeft - 180;
    const hoverT = Math.max(0, Math.min(duration, pixelsToTime(mouseX)));
    setRulerHoverTime(hoverT);
  };

  const updatePlayheadFromMouseEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const mouseX = e.clientX - rect.left + scrollLeft - 180;
    let newTime = Math.max(0, Math.min(duration, pixelsToTime(mouseX)));

    // Magnetic snapping to In/Out points or clip edges
    if (snappingEnabled) {
      const snapPoints = [
        0,
        inPoint ?? -999,
        outPoint ?? -999,
        ...clips.map((c) => c.startTime),
        ...clips.map((c) => c.startTime + c.duration),
      ];
      const threshold = 8 / timelineZoom; // 8px snap threshold
      for (const sp of snapPoints) {
        if (Math.abs(newTime - sp) < threshold) {
          newTime = sp;
          setSnapLineX(timeToPixels(sp));
          break;
        } else {
          setSnapLineX(null);
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
        const deltaTime = deltaPx / timelineZoom;
        let newTime = Math.max(0, clipOriginalStartTime + deltaTime);

        // Magnetic snapping during clip drag
        if (snappingEnabled) {
          const threshold = 10 / timelineZoom;
          const otherClips = clips.filter((c) => c.id !== draggingClipId);
          const snapTargets = [
            currentTime,
            0,
            inPoint ?? -999,
            outPoint ?? -999,
            ...otherClips.map((c) => c.startTime),
            ...otherClips.map((c) => c.startTime + c.duration),
          ];

          for (const target of snapTargets) {
            if (Math.abs(newTime - target) < threshold) {
              newTime = target;
              setSnapLineX(timeToPixels(target));
              break;
            } else {
              setSnapLineX(null);
            }
          }
        }

        moveClip(draggingClipId, newTime);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClipId(null);
      setSnapLineX(null);
    };

    if (isScrubbing || draggingClipId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, draggingClipId, dragStartX, clipOriginalStartTime, timelineZoom, duration, snappingEnabled, clips, inPoint, outPoint, currentTime]);

  // Clip drag initiation
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

  // Generate ruler tick marks
  const tickIntervalSec = timelineZoom < 30 ? 5 : timelineZoom < 70 ? 2 : 1;
  const totalTicks = Math.ceil(duration / tickIntervalSec);

  return (
    <div className="flex flex-col h-full bg-nle-canvas border-t border-nle-border text-xs select-none">
      {/* Timeline Controls Bar */}
      <div className="flex items-center justify-between px-3 h-8 bg-nle-header border-b border-nle-border">
        {/* Left: Sequence title & clip count */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-nle-accent">view_timeline</span>
          <span className="font-semibold text-nle-text text-[11px] uppercase tracking-wider">
            Sequence Timeline
          </span>
          <span className="px-1.5 py-0.2 rounded bg-nle-panel border border-nle-border text-3xs font-mono text-nle-dim">
            {clips.length} Clips • {tracks.length} Tracks
          </span>
        </div>

        {/* Center: Silence Cuts HUD Indicator */}
        {silenceState.isPreviewActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-nle-crimson/15 border border-nle-crimson/40 text-nle-crimson text-3xs font-mono font-semibold animate-pulse">
            <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            <span>AI Silence Ripple Preview: 5 Cuts Highlighted</span>
          </div>
        )}

        {/* Right: Zoom slider & tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimelineZoom(timelineZoom - 10)}
            className="p-1 rounded hover:bg-nle-panel text-nle-dim hover:text-white"
            title="Zoom Out (-)"
          >
            <span className="material-symbols-outlined text-[15px]">zoom_out</span>
          </button>

          <input
            type="range"
            min="15"
            max="150"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(Number(e.target.value))}
            className="w-24 h-1 bg-nle-border rounded appearance-none accent-nle-accent cursor-pointer"
            title="Timeline Zoom Level"
          />

          <button
            onClick={() => setTimelineZoom(timelineZoom + 10)}
            className="p-1 rounded hover:bg-nle-panel text-nle-dim hover:text-white"
            title="Zoom In (+)"
          >
            <span className="material-symbols-outlined text-[15px]">zoom_in</span>
          </button>

          <div className="w-[1px] h-3 bg-nle-border mx-1" />

          {/* Delete clip button */}
          <button
            onClick={deleteSelectedClip}
            disabled={!selectedClipId}
            className={`p-1 rounded transition-colors ${
              selectedClipId ? 'text-nle-crimson hover:bg-nle-crimson/15' : 'text-nle-muted cursor-not-allowed'
            }`}
            title="Delete Selected Clip (Del / Backspace)"
          >
            <span className="material-symbols-outlined text-[15px]">delete</span>
          </button>
        </div>
      </div>

      {/* Main Timeline Workspace (Tracks + Peak VU Meter) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scrollable Tracks Area */}
        <div
          ref={timelineContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative flex"
        >
          {/* Track Headers Column (Fixed 180px width) */}
          <div className="w-48 sticky left-0 z-20 bg-nle-surface border-r border-nle-border flex flex-col shrink-0">
            {/* Header placeholder for Ruler alignment */}
            <div className="h-7 bg-nle-header border-b border-nle-border flex items-center justify-between px-2 font-mono text-3xs text-nle-dim">
              <span>TRACK HEADERS</span>
              <span>M / S / L</span>
            </div>

            {/* Track Header Items */}
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-14 border-b border-nle-border flex items-center justify-between px-2 bg-nle-surface/95 hover:bg-nle-panel transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-1.5 h-6 rounded-sm shrink-0"
                    style={{ backgroundColor: track.color || '#00e5ff' }}
                  />
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-[11px] text-nle-text truncate" title={track.name}>
                      {track.name}
                    </span>
                    <span className="text-3xs font-mono text-nle-dim uppercase">
                      {track.type} {track.volumeDb !== 0 ? `(${track.volumeDb}dB)` : ''}
                    </span>
                  </div>
                </div>

                {/* Mute, Solo, Sync, Lock Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center transition-colors ${
                      track.isMuted
                        ? 'bg-nle-crimson text-white shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                        : 'bg-nle-panel text-nle-dim hover:text-white border border-nle-border'
                    }`}
                    title="Mute Track (M)"
                  >
                    M
                  </button>

                  <button
                    onClick={() => toggleSolo(track.id)}
                    className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center transition-colors ${
                      track.isSolo
                        ? 'bg-nle-amber text-black shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                        : 'bg-nle-panel text-nle-dim hover:text-white border border-nle-border'
                    }`}
                    title="Solo Track (S)"
                  >
                    S
                  </button>

                  <button
                    onClick={() => toggleSyncLock(track.id)}
                    className={`p-0.5 rounded text-[12px] transition-colors ${
                      track.isSyncLocked ? 'text-nle-accent' : 'text-nle-muted'
                    }`}
                    title="Toggle Sync Lock"
                  >
                    <span className="material-symbols-outlined text-[13px]">sync_alt</span>
                  </button>

                  <button
                    onClick={() => toggleLock(track.id)}
                    className={`p-0.5 rounded text-[12px] transition-colors ${
                      track.isLocked ? 'text-nle-crimson' : 'text-nle-muted'
                    }`}
                    title="Lock Track"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {track.isLocked ? 'lock' : 'lock_open'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Canvas (Ruler + Tracks Body) */}
          <div
            className="relative flex-1 bg-nle-canvas select-none"
            style={{ width: `${Math.max(1200, timeToPixels(duration))}px` }}
          >
            {/* Top Scrubbable Ruler */}
            <div
              ref={rulerRef}
              onMouseDown={handleRulerMouseDown}
              onMouseMove={handleRulerMouseMove}
              onMouseLeave={() => setRulerHoverTime(null)}
              className="h-7 bg-nle-header border-b border-nle-border sticky top-0 z-10 cursor-ew-resize flex items-end relative overflow-hidden"
            >
              {Array.from({ length: totalTicks }).map((_, idx) => {
                const tickTime = idx * tickIntervalSec;
                const leftPx = timeToPixels(tickTime);
                const isMajor = tickTime % 5 === 0;
                return (
                  <div
                    key={idx}
                    className="absolute bottom-0 flex flex-col items-center pointer-events-none"
                    style={{ left: `${leftPx}px` }}
                  >
                    {isMajor && (
                      <span className="text-[9px] font-mono text-nle-dim leading-none mb-1">
                        {formatDuration(tickTime)}
                      </span>
                    )}
                    <div
                      className={`w-[1px] ${
                        isMajor ? 'h-3 bg-nle-dim' : 'h-1.5 bg-nle-border'
                      }`}
                    />
                  </div>
                );
              })}

              {/* Hover time tooltip on ruler */}
              {rulerHoverTime !== null && !isScrubbing && (
                <div
                  className="absolute top-1 pointer-events-none z-20 bg-nle-panel border border-nle-border px-1.5 py-0.2 rounded text-[9px] font-mono text-white shadow"
                  style={{ left: `${timeToPixels(rulerHoverTime)}px`, transform: 'translateX(-50%)' }}
                >
                  {formatDuration(rulerHoverTime)}
                </div>
              )}

              {/* In & Out Highlight Range */}
              {inPoint !== null && outPoint !== null && (
                <div
                  className="absolute top-0 bottom-0 bg-nle-accent/15 border-l-2 border-r-2 border-nle-accent pointer-events-none z-0"
                  style={{
                    left: `${timeToPixels(inPoint)}px`,
                    width: `${timeToPixels(outPoint - inPoint)}px`,
                  }}
                />
              )}

              {/* Silence Cut DEL Markers on Ruler */}
              {silenceState.isPreviewActive &&
                silenceState.cuts.map((cut) => (
                  <div
                    key={cut.id}
                    className="absolute top-0 bottom-0 bg-nle-crimson/30 border-l border-r border-nle-crimson pointer-events-none z-1 flex items-center justify-center"
                    style={{
                      left: `${timeToPixels(cut.startTime)}px`,
                      width: `${timeToPixels(cut.duration)}px`,
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-white bg-nle-crimson px-0.5 rounded">
                      DEL
                    </span>
                  </div>
                ))}
            </div>

            {/* Magnetic Snap Guide Line */}
            {snapLineX !== null && (
              <div
                className="absolute top-0 bottom-0 w-[1px] bg-nle-accent pointer-events-none z-25 shadow-[0_0_8px_#00e5ff]"
                style={{
                  left: `${snapLineX}px`,
                  height: `${tracks.length * 56 + 28}px`,
                }}
              />
            )}

            {/* Tracks Body */}
            <div className="relative">
              {tracks.map((track) => {
                const trackClips = clips.filter((c) => c.trackId === track.id);
                return (
                  <div
                    key={track.id}
                    className="h-14 border-b border-nle-border/60 relative bg-nle-canvas/40"
                  >
                    {/* Silence Cut Preview Overlays on track */}
                    {silenceState.isPreviewActive &&
                      (track.type === 'audio' || track.id === 'v1') &&
                      silenceState.cuts.map((cut) => (
                        <div
                          key={`cut-${track.id}-${cut.id}`}
                          className="absolute top-0 bottom-0 bg-nle-crimson/25 border-l border-r border-nle-crimson/60 pointer-events-none z-5 flex items-center justify-center"
                          style={{
                            left: `${timeToPixels(cut.startTime)}px`,
                            width: `${timeToPixels(cut.duration)}px`,
                          }}
                        >
                          <span className="text-[9px] font-mono font-bold text-nle-crimson bg-black/60 px-1 rounded">
                            ✂ {cut.duration.toFixed(1)}s
                          </span>
                        </div>
                      ))}

                    {/* Clip Blocks */}
                    {trackClips.map((clip) => {
                      const isSelected = selectedClipId === clip.id;
                      const leftPx = timeToPixels(clip.startTime);
                      const widthPx = timeToPixels(clip.duration);

                      return (
                        <div
                          key={clip.id}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                          className={`absolute top-1 bottom-1 rounded overflow-hidden cursor-pointer transition-shadow flex flex-col justify-between border ${
                            isSelected
                              ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] z-10'
                              : 'border-black/40 hover:border-white/50 z-2'
                          }`}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                            backgroundColor: clip.color ? `${clip.color}22` : '#00e5ff22',
                          }}
                        >
                          {/* Clip Header Strip */}
                          <div
                            className="px-1.5 py-0.5 flex items-center justify-between text-[10px] font-semibold text-white truncate"
                            style={{ backgroundColor: clip.color || '#00e5ff' }}
                          >
                            <span className="truncate" title={clip.title}>
                              {clip.title}
                            </span>
                            <span className="text-3xs font-mono opacity-80 shrink-0">
                              {clip.duration.toFixed(1)}s
                            </span>
                          </div>

                          {/* Clip Body Waveform / Filmstrip thumbnail simulation */}
                          <div className="flex-1 relative overflow-hidden flex items-center px-1">
                            {clip.type === 'audio' ? (
                              /* SVG Audio Waveform */
                              <svg className="w-full h-6 opacity-70" preserveAspectRatio="none" viewBox="0 0 100 24">
                                <path
                                  d="M0,12 Q5,2 10,12 T20,12 T30,4 T40,12 T50,1 T60,12 T70,5 T80,12 T90,3 T100,12"
                                  fill="none"
                                  stroke={clip.color || '#10b981'}
                                  strokeWidth="2"
                                />
                                <path
                                  d="M0,12 Q5,18 10,12 T20,12 T30,20 T40,12 T50,22 T60,12 T70,18 T80,12 T90,20 T100,12"
                                  fill="none"
                                  stroke={clip.color || '#10b981'}
                                  strokeWidth="1.5"
                                  opacity="0.6"
                                />
                              </svg>
                            ) : clip.type === 'subtitle' ? (
                              <span className="text-3xs font-mono text-nle-amber italic truncate">
                                [CC] Diarized Host Sync
                              </span>
                            ) : (
                              /* Video Thumbnail strip placeholder */
                              <div className="flex items-center gap-1 opacity-40">
                                {Array.from({ length: Math.min(8, Math.max(1, Math.floor(widthPx / 60))) }).map((_, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="w-12 h-6 bg-black/40 rounded border border-white/10 shrink-0"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Clip Left & Right Trim Handles */}
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-white/30 hover:w-2 hover:bg-white cursor-ew-resize transition-all" />
                          <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/30 hover:w-2 hover:bg-white cursor-ew-resize transition-all" />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Scrubbable Playhead Indicator Line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-nle-accent pointer-events-none z-30 shadow-[0_0_8px_#00e5ff]"
                style={{
                  left: `${timeToPixels(currentTime)}px`,
                  height: `${tracks.length * 56}px`,
                }}
              >
                {/* Playhead Cursor Arrow */}
                <div className="w-3.5 h-3.5 -ml-[6px] -mt-2 bg-nle-accent rotate-45 rounded-sm shadow-md flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Stereo Audio VU Peak Meter (Sample-Accurate 16.6ms) */}
        <div className="w-12 bg-nle-surface border-l border-nle-border flex flex-col items-center py-2 shrink-0 select-none">
          <span className="text-[9px] font-mono text-nle-dim uppercase tracking-tighter mb-1">
            MASTER
          </span>

          {/* VU Bars Container */}
          <div className="flex-1 w-6 bg-black/60 rounded border border-nle-border p-0.5 flex gap-1 justify-center relative">
            {/* Left Channel */}
            <div className="flex-1 bg-nle-border/40 rounded-sm overflow-hidden flex flex-col justify-end">
              <div
                className="w-full bg-gradient-to-t from-nle-emerald via-nle-amber to-nle-crimson transition-all duration-75"
                style={{
                  height: `${Math.max(4, Math.min(100, ((audioPeakL + 60) / 66) * 100))}%`,
                }}
              />
            </div>

            {/* Right Channel */}
            <div className="flex-1 bg-nle-border/40 rounded-sm overflow-hidden flex flex-col justify-end">
              <div
                className="w-full bg-gradient-to-t from-nle-emerald via-nle-amber to-nle-crimson transition-all duration-75"
                style={{
                  height: `${Math.max(4, Math.min(100, ((audioPeakR + 60) / 66) * 100))}%`,
                }}
              />
            </div>

            {/* Decibel tick markings */}
            <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-between text-[7px] font-mono text-nle-dim pointer-events-none">
              <span>+6</span>
              <span>0</span>
              <span>-6</span>
              <span>-12</span>
              <span>-24</span>
              <span>-40</span>
            </div>
          </div>

          {/* Numerical Peak Readout */}
          <span className="text-[8px] font-mono text-nle-text font-bold mt-1">
            {audioPeakL > -60 ? `${audioPeakL.toFixed(1)}` : '-inf'}
          </span>
        </div>
      </div>
    </div>
  );
};
