import React, { useEffect } from 'react';
import { useTimelineStore } from './state/timelineStore';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { MediaBin } from './components/MediaBin';
import { ProgramMonitor } from './components/ProgramMonitor';
import { InspectorHub } from './components/InspectorHub';
import { Timeline } from './components/Timeline';
import { WelcomeModal } from './components/WelcomeModal';
import { BatchQueueModal } from './components/BatchQueueModal';
import { VoiceModal } from './components/VoiceModal';
import { RenderProgressModal } from './components/RenderProgressModal';
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
  } = useTimelineStore();

  // Global Keyboard Shortcuts (J-K-L, Space, I, O, C, V, M, Del, etc.)
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

      // Frame Stepping
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
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
      {/* Top Application Bar & Menu */}
      <TopBar />

      {/* Main Multi-Panel Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Leftmost Ergonomic Toolbar */}
        <Toolbar />

        {/* Center Canvas & Side Docks */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Upper Section: Media Bin, Program Monitor, Inspector Hub */}
          <div className="flex flex-1 min-h-[320px] max-h-[58%] border-b border-nle-border overflow-hidden">
            {/* Left Footage Browser / Media Bin */}
            <div className="w-80 min-w-[260px] max-w-[340px] shrink-0 h-full">
              <MediaBin />
            </div>

            {/* Center Program Monitor (60 FPS Canvas) */}
            <div className="flex-1 h-full min-w-[380px]">
              <ProgramMonitor />
            </div>

            {/* Right Inspector & AI Hub Dock */}
            <div className="w-96 min-w-[320px] max-w-[420px] shrink-0 h-full">
              <InspectorHub />
            </div>
          </div>

          {/* Lower Section: Multi-Track Timeline Engine */}
          <div className="flex-1 min-h-[220px] overflow-hidden">
            <Timeline />
          </div>
        </div>
      </div>

      {/* Global Modals & Dialogs */}
      <WelcomeModal />
      <BatchQueueModal />
      <VoiceModal />
      <RenderProgressModal />
      <Toast />
    </div>
  );
};
export default App;
