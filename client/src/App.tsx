import React, { useEffect } from 'react';
import { useTimelineStore } from './state/timelineStore';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { LearnPanel } from './components/LearnPanel';
import { SourceMonitor } from './components/SourceMonitor';
import { ProgramMonitor } from './components/ProgramMonitor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MediaBin } from './components/MediaBin';
import { Timeline } from './components/Timeline';
import { WelcomeModal } from './components/WelcomeModal';
import { BatchQueueModal } from './components/BatchQueueModal';
import { VoiceModal } from './components/VoiceModal';
import { RenderProgressModal } from './components/RenderProgressModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  const {
    togglePlayPause,
    stepFrame,
    setInPoint,
    setOutPoint,
    splitClipAtPlayhead,
    deleteSelectedClip,
    setActiveTool,
    undo,
    redo,
    openRenderProgressModal,
    setWelcomeOpen,
    setNewProjectOpen,
    isPlaying,
    playbackRate,
    setPlaybackRate,
    currentTime,
    duration,
    setCurrentTime,
    isMediaBinOpen,
    isInspectorOpen,
    toggleKeyboardHelp,
    toggleSnapping,
    showToastBanner,
  } = useTimelineStore();

  // Sanitize any existing visual clips that were saved on audio tracks & ensure startTime = 0 for single clip
  useEffect(() => {
    const { clips, mediaAssets } = useTimelineStore.getState();
    if (clips.length > 0) {
      const fixedClips = clips.map((c) => {
        const isVisual = /\.(jpg|jpeg|png|webp|gif|svg|mp4|mov|webm)$/i.test(c.title);
        const asset = mediaAssets.find((a) => a.name === c.title || a.id === c.id);
        const newStartTime = clips.length === 1 ? 0 : c.startTime; // Snap single clip to start of timeline
        return {
          ...c,
          startTime: newStartTime,
          trackId: isVisual ? 'v1' : c.trackId,
          type: isVisual ? ('video' as const) : c.type,
          mediaUrl: c.mediaUrl || asset?.url || asset?.thumbnail,
          color: isVisual ? '#00e5ff' : c.color,
        };
      });
      const maxDur = Math.max(30, Math.max(...fixedClips.map((c) => c.startTime + c.duration)) + 5);
      useTimelineStore.setState({ clips: fixedClips, duration: maxDur });
    } else {
      useTimelineStore.setState({ duration: 30 });
    }
  }, []);

  // Global Keyboard Shortcuts (J-K-L, Space, I, O, C, V, M, Del, ?, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // New / Open / Export
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNewProjectOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setWelcomeOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        openRenderProgressModal();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showToastBanner('Project saved to Local Storage');
        return;
      }

      // Help Modal (?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        toggleKeyboardHelp();
        return;
      }

      // Space Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
        return;
      }

      // J-K-L Transport Controls
      if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setPlaybackRate(-1);
        return;
      }
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPlaybackRate(0);
        return;
      }
      if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setPlaybackRate(playbackRate === 1 ? 2 : 1);
        return;
      }

      // In / Out Points
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setInPoint();
        return;
      }
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setOutPoint();
        return;
      }

      // Editing Tools
      if (e.key.toLowerCase() === 'v') {
        setActiveTool('selection');
        return;
      }
      if (e.key.toLowerCase() === 'c') {
        setActiveTool('razor_cut');
        splitClipAtPlayhead();
        return;
      }
      if (e.key.toLowerCase() === 'b') {
        setActiveTool('ripple_edit');
        return;
      }
      if (e.key.toLowerCase() === 'a') {
        setActiveTool('track_forward');
        return;
      }
      if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        toggleSnapping();
        return;
      }

      // Frame Stepping
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(e.shiftKey ? -5 : -1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepFrame(e.shiftKey ? 5 : 1);
        return;
      }

      // Delete Clip
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedClip();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlayPause,
    stepFrame,
    setInPoint,
    setOutPoint,
    splitClipAtPlayhead,
    deleteSelectedClip,
    setActiveTool,
    undo,
    redo,
    openRenderProgressModal,
    setWelcomeOpen,
    setNewProjectOpen,
    playbackRate,
    setPlaybackRate,
    toggleKeyboardHelp,
    toggleSnapping,
  ]);

  // 60 FPS Real-time Playback Loop (Continuous frame pump reading direct Zustand state)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      const state = useTimelineStore.getState();
      const maxDur = Math.max(30, state.duration);

      if (state.isPlaying && state.playbackRate !== 0) {
        let nextTime = state.currentTime + deltaSec * state.playbackRate;
        if (nextTime >= maxDur) {
          nextTime = 0; // loop back to 0
        } else if (nextTime < 0) {
          nextTime = maxDur;
        }
        state.setCurrentTime(nextTime);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#181818] text-[#e1e1e1] font-sans">
      {/* 1. Authentic 3-Tier Adobe Premiere Pro Chrome & Menus */}
      <TopBar />

      {/* 2. Main Multi-Panel Workspace Body (Exact Premiere Pro 2024 Layout) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Upper Deck (Learn Dock, Source Monitor, Program Monitor, Properties Dock) */}
        <div className="flex flex-1 min-h-[220px] max-h-[50%] border-b border-[#303030] overflow-hidden">
          {/* Left: Learn / Tutorials Panel */}
          {isMediaBinOpen && (
            <div className="w-[260px] min-w-[220px] max-w-[300px] shrink-0 h-full">
              <LearnPanel />
            </div>
          )}

          {/* Center-Left: Source Monitor (Source: (no clips) ≡) */}
          <div className="flex-1 h-full min-w-[240px]">
            <SourceMonitor />
          </div>

          {/* Center-Right: Program Monitor (Program: (no sequences) ≡) */}
          <div className="flex-1 h-full min-w-[240px]">
            <ProgramMonitor />
          </div>

          {/* Right: Properties Panel (Properties ≡) */}
          {isInspectorOpen && (
            <div className="w-[260px] min-w-[220px] max-w-[320px] shrink-0 h-full">
              <PropertiesPanel />
            </div>
          )}
        </div>

        {/* Lower Deck: Project Assets / Media Browser, Vertical Toolbar, Sequence Timeline */}
        <div className="flex flex-1 min-h-[200px] overflow-hidden">
          {/* Bottom-Left: Project / Media Browser (Project: Untitled ≡) */}
          {isMediaBinOpen && (
            <div className="w-[260px] min-w-[220px] max-w-[300px] shrink-0 h-full">
              <MediaBin />
            </div>
          )}

          {/* Vertical Ergonomic Toolbar (Selection, Razor, Ripple, Slip, Pen, Hand, Type) */}
          <Toolbar />

          {/* Multi-Track Sequence Timeline Engine with Dynamic Stereo VU Meter */}
          <div className="flex-1 h-full overflow-hidden">
            <Timeline />
          </div>
        </div>
      </div>

      {/* Global Modals & Dialogs */}
      <WelcomeModal />
      <BatchQueueModal />
      <VoiceModal />
      <RenderProgressModal />
      <KeyboardShortcutsModal />
      <Toast />
    </div>
  );
};

export default App;
