import React, { useEffect } from 'react';
import { useTimelineStore } from './state/timelineStore';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { LearnPanel } from './components/LearnPanel';
import { SourceMonitor } from './components/SourceMonitor';
import { ProgramMonitor } from './components/ProgramMonitor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MediaBin } from './components/MediaBin';
import { QuickActionBar } from './components/QuickActionBar';
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
  } = useTimelineStore();

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
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) {
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

  // 60 FPS Real-time Playback Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && playbackRate !== 0) {
        const nextTime = currentTime + deltaSec * playbackRate;
        if (nextTime >= duration) {
          setCurrentTime(0); // loop
        } else if (nextTime < 0) {
          setCurrentTime(duration);
        } else {
          setCurrentTime(nextTime);
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackRate, currentTime, duration, setCurrentTime]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-nle-bg text-nle-text font-sans">
      {/* Top Application Bar & Menus (File, Edit, Clip, Sequence, Markers, Graphics, View, Window, Help) */}
      <TopBar />

      {/* Main Multi-Panel Workspace Body (Matching Premiere Pro Screenshot) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Upper Section: Learn Dock, Source Monitor, Program Monitor, Properties Dock */}
        <div className="flex flex-1 min-h-[280px] max-h-[55%] border-b border-nle-border overflow-hidden">
          {/* 1. Left: Learn / Tutorials Panel */}
          {isMediaBinOpen && (
            <div className="w-72 min-w-[240px] max-w-[320px] shrink-0 h-full">
              <LearnPanel />
            </div>
          )}

          {/* 2. Center-Left: Source Monitor (Source: (no clips) ≡) */}
          <div className="flex-1 h-full min-w-[260px]">
            <SourceMonitor />
          </div>

          {/* 3. Center-Right: Program Monitor (Program: (no sequences) ≡) */}
          <div className="flex-1 h-full min-w-[260px]">
            <ProgramMonitor />
          </div>

          {/* 4. Right: Properties / AI Hub Panel (Properties ≡) */}
          {isInspectorOpen && (
            <div className="w-80 min-w-[260px] max-w-[360px] shrink-0 h-full">
              <PropertiesPanel />
            </div>
          )}
        </div>

        {/* Quick Action Magic Bar (Hero AI Superpowers & Panel Toggles) */}
        <QuickActionBar />

        {/* Lower Section: Project Assets / Media Browser, Toolbar, Multi-Track Sequence Timeline */}
        <div className="flex flex-1 min-h-[220px] overflow-hidden">
          {/* Bottom-Left: Project / Media Browser (Project: Untitled ≡) */}
          {isMediaBinOpen && (
            <div className="w-72 min-w-[240px] max-w-[320px] shrink-0 h-full border-r border-nle-border">
              <MediaBin />
            </div>
          )}

          {/* Vertical Ergonomic Toolbar (Selection, Razor, Ripple, Slip, Pen, Hand) */}
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
