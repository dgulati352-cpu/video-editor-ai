import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { WorkspaceLayout } from '../types';
import { secondsToSMPTE } from '../utils/timecode';

export const TopBar: React.FC = () => {
  const {
    projectName,
    currentTime,
    duration,
    frameRate,
    activeWorkspace,
    setActiveWorkspace,
    themeMode,
    toggleTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    openVoiceModal,
    openRenderProgressModal,
    setWelcomeOpen,
    setNewProjectOpen,
    setBatchQueueOpen,
    showToastBanner,
  } = useTimelineStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems: Record<string, { label: string; shortcut?: string; action: () => void }[]> = {
    File: [
      { label: 'New Project...', shortcut: 'Ctrl+N', action: () => setNewProjectOpen(true) },
      { label: 'Open Project Home...', shortcut: 'Ctrl+O', action: () => setWelcomeOpen(true) },
      { label: 'Save Project Manifest (.cfs)', shortcut: 'Ctrl+S', action: () => showToastBanner('Saved .cfs SQLite manifest (WAL mode)') },
      { label: 'Batch Render Queue...', shortcut: 'Ctrl+B', action: () => setBatchQueueOpen(true) },
      { label: 'Export Final Master...', shortcut: 'Ctrl+M', action: () => openRenderProgressModal() },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => undo() },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => redo() },
      { label: 'Ripple Trim Dead Air...', shortcut: 'Shift+R', action: () => showToastBanner('Triggering AI Ripple Trim pipeline') },
      { label: 'Preferences...', shortcut: 'Ctrl+,', action: () => showToastBanner('Preferences: 4K UHD, ACEScg, 60fps') },
    ],
    Clip: [
      { label: 'Split at Playhead (Razor)', shortcut: 'C', action: () => showToastBanner('Press C to razor cut') },
      { label: 'Speed / Duration...', shortcut: 'Ctrl+R', action: () => showToastBanner('Clip Speed: 1.0x (Optical Flow)') },
      { label: 'Enable / Disable Clip', shortcut: 'V', action: () => showToastBanner('Clip toggled') },
      { label: 'Audio Gain...', shortcut: 'G', action: () => showToastBanner('Audio Gain: 0.0 dB') },
    ],
    Sequence: [
      { label: 'Render In to Out', shortcut: 'Return', action: () => openRenderProgressModal() },
      { label: 'Delete Silence Gaps', shortcut: 'Alt+Del', action: () => showToastBanner('Applied 5 AI silence ripple cuts') },
      { label: 'Match Frame', shortcut: 'F', action: () => showToastBanner('Matched source monitor frame') },
    ],
    Markers: [
      { label: 'Add Marker', shortcut: 'M', action: () => showToastBanner('Added timeline marker') },
      { label: 'Clear In and Out', shortcut: 'Ctrl+Shift+X', action: () => showToastBanner('Cleared In/Out points') },
    ],
    Window: [
      { label: 'Workspace: Editing', action: () => setActiveWorkspace('editing') },
      { label: 'Workspace: Color', action: () => setActiveWorkspace('color') },
      { label: 'Workspace: Audio', action: () => setActiveWorkspace('audio') },
      { label: 'Workspace: Graphics', action: () => setActiveWorkspace('graphics') },
      { label: 'Reset to Default Layout', action: () => showToastBanner('Workspace layout reset') },
    ],
    Help: [
      { label: 'ClipFlow Studio 2.1.0 Docs', action: () => showToastBanner('Opening ClipFlow NLE Manual') },
      { label: 'Keyboard Shortcuts Reference', shortcut: 'Ctrl+Alt+K', action: () => showToastBanner('Shortcuts: J-K-L, Space, I, O, C, V, M, S') },
    ],
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const workspaces: { id: WorkspaceLayout; label: string }[] = [
    { id: 'editing', label: 'Editing' },
    { id: 'color', label: 'Color' },
    { id: 'audio', label: 'Audio' },
    { id: 'graphics', label: 'Graphics' },
  ];

  return (
    <header className="relative z-50 flex items-center justify-between px-3 h-10 w-full bg-nle-header border-b border-nle-border text-xs select-none">
      {/* Left: App Logo, Home Icon, Menu Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Home / Projects Dashboard Button */}
        <button
          onClick={() => setWelcomeOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-nle-panel text-nle-text transition-colors"
          title="Open Project Dashboard (Ctrl+O)"
        >
          <span className="material-symbols-outlined text-[18px] text-nle-accent">movie_filter</span>
          <span className="font-bold tracking-tight text-white text-[13px] hidden md:inline">
            ClipFlow <span className="text-nle-accent font-mono text-2xs">2.1</span>
          </span>
        </button>

        <div className="h-4 w-[1px] bg-nle-border mx-1" />

        {/* Global Menu Bar */}
        <div className="relative flex items-center gap-0.5">
          {Object.keys(menuItems).map((menu) => (
            <div key={menu} className="relative">
              <button
                onClick={() => handleMenuClick(menu)}
                onMouseEnter={() => activeMenu && setActiveMenu(menu)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeMenu === menu ? 'bg-nle-border text-white' : 'text-nle-dim hover:text-nle-text'
                }`}
              >
                {menu}
              </button>

              {activeMenu === menu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeMenu} />
                  <div className="absolute left-0 top-full mt-1 w-56 py-1 bg-nle-panel border border-nle-border rounded shadow-2xl z-50 text-[11px]">
                    {menuItems[menu].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          item.action();
                          closeMenu();
                        }}
                        className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-nle-accent/20 hover:text-white transition-colors text-nle-text"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-3xs text-nle-dim font-mono tracking-wider">{item.shortcut}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="h-4 w-[1px] bg-nle-border mx-1 hidden lg:block" />

        {/* Project Name and Auto-Saved Status */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="font-mono text-[11px] text-nle-text font-semibold max-w-[200px] truncate" title={projectName}>
            {projectName}
          </span>
          <span className="flex items-center gap-1 text-3xs text-nle-emerald font-mono bg-nle-emerald/10 border border-nle-emerald/20 px-1.5 py-0.2 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-nle-emerald animate-pulse" />
            WAL Safe
          </span>
        </div>
      </div>

      {/* Center: Workspace Layout Tabs & SMPTE Timecode */}
      <div className="flex items-center gap-3">
        {/* Workspace Switcher */}
        <div className="flex items-center bg-nle-canvas p-0.5 rounded border border-nle-border">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setActiveWorkspace(ws.id)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                activeWorkspace === ws.id
                  ? 'bg-nle-surface text-nle-accent shadow-sm font-semibold'
                  : 'text-nle-dim hover:text-nle-text'
              }`}
            >
              {ws.label}
            </button>
          ))}
        </div>

        {/* Timecode Readout */}
        <div className="hidden sm:flex items-center gap-2 bg-nle-canvas px-2.5 py-0.5 rounded border border-nle-border font-mono text-[11px]">
          <span className="text-nle-accent font-semibold tracking-wider">
            {secondsToSMPTE(currentTime, frameRate)}
          </span>
          <span className="text-nle-muted">/</span>
          <span className="text-nle-dim tracking-wider">
            {secondsToSMPTE(duration, frameRate)}
          </span>
        </div>
      </div>

      {/* Right: Undo/Redo, AI Copilot, Theme Toggle, Export Button */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-nle-canvas rounded border border-nle-border p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1 rounded transition-colors ${
              canUndo ? 'text-nle-text hover:bg-nle-panel' : 'text-nle-muted cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
          </button>
          <div className="w-[1px] h-3 bg-nle-border mx-0.5" />
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1 rounded transition-colors ${
              canRedo ? 'text-nle-text hover:bg-nle-panel' : 'text-nle-muted cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <span className="material-symbols-outlined text-[16px]">redo</span>
          </button>
        </div>

        {/* AI Copilot Studio Quick Trigger */}
        <button
          onClick={openVoiceModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-nle-accent/10 border border-nle-accent/40 text-nle-accent hover:bg-nle-accent/20 transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)]"
          title="Open AI Copilot & Voice Telemetry"
        >
          <span className="material-symbols-outlined text-[16px] animate-pulse">auto_awesome</span>
          <span className="hidden sm:inline font-semibold text-[11px]">AI Copilot</span>
        </button>

        {/* Batch Queue Button */}
        <button
          onClick={() => setBatchQueueOpen(true)}
          className="p-1 rounded bg-nle-canvas hover:bg-nle-panel border border-nle-border text-nle-dim hover:text-nle-text transition-colors"
          title="Batch Render Queue"
        >
          <span className="material-symbols-outlined text-[16px]">queue_play_next</span>
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-1 rounded bg-nle-canvas hover:bg-nle-panel border border-nle-border text-nle-dim hover:text-nle-text transition-colors"
          title={themeMode === 'dark' ? 'Switch to Editorial Light Mode' : 'Switch to Studio Dark Mode'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {themeMode === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Export Button */}
        <button
          onClick={openRenderProgressModal}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-nle-blue hover:bg-nle-blue/90 text-white font-semibold text-[11px] shadow-[0_0_12px_rgba(13,153,255,0.3)] active:scale-95 transition-all"
          title="Export Sequence Master (Ctrl+M)"
        >
          <span className="material-symbols-outlined text-[16px]">ios_share</span>
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
