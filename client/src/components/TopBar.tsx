import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { WorkspaceLayout } from '../types';
import { secondsToSMPTE } from '../utils/timecode';

interface MenuItem {
  type?: 'item' | 'divider';
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  hasSubmenu?: boolean;
  submenu?: MenuItem[];
  action?: () => void;
}

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
    recentProjects,
    exportSubtitles,
    splitClipAtPlayhead,
    deleteSelectedClip,
    clearInOut,
    setInPoint,
    setOutPoint,
    selectedClipId,
    selectClip,
    clips,
  } = useTimelineStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuDefinitions: Record<string, MenuItem[]> = {
    File: [
      {
        label: 'New',
        hasSubmenu: true,
        submenu: [
          { label: 'Project...', shortcut: 'Ctrl+Alt+N', action: () => setNewProjectOpen(true) },
          { label: 'Sequence...', shortcut: 'Ctrl+N', action: () => showToastBanner('Created New Sequence (4K UHD 60fps)') },
          { label: 'Adjustment Layer...', action: () => showToastBanner('Added Adjustment Layer to V3') },
          { label: 'Title Card (MOGRT)...', action: () => showToastBanner('Added Motion Graphics Title') },
          { label: 'Color Matte...', action: () => showToastBanner('Generated 16-bit Color Matte') },
          { label: 'Bars and Tone...', action: () => showToastBanner('Generated SMPTE Color Bars & 1kHz Tone') },
        ],
      },
      { label: 'Open Project...', shortcut: 'Ctrl+O', action: () => setWelcomeOpen(true) },
      { label: 'Open Production...', disabled: false, action: () => showToastBanner('Opening Production Workspace...') },
      { label: 'Open Team Project...', disabled: false, action: () => showToastBanner('Connecting to Team Sequence Lock...') },
      {
        label: 'Open Recent',
        hasSubmenu: true,
        submenu: [
          ...recentProjects.map((p) => ({
            label: p.name,
            action: () => showToastBanner(`Opened: ${p.name}`),
          })),
          { type: 'divider' },
          { label: 'Clear Recent Files', action: () => showToastBanner('Recent files list cleared') },
        ],
      },
      { type: 'divider' },
      { label: 'Close', shortcut: 'Ctrl+W', action: () => showToastBanner('Closing active panel') },
      { label: 'Close Project', shortcut: 'Ctrl+Shift+W', action: () => setWelcomeOpen(true) },
      { label: 'Close Production', disabled: true },
      { label: 'Close All Projects', action: () => setWelcomeOpen(true) },
      { label: 'Close All Other Projects', disabled: true },
      { label: 'Refresh All Projects', disabled: true },
      { type: 'divider' },
      { label: 'Save', shortcut: 'Ctrl+S', action: () => showToastBanner('Auto-Saved SQLite database (WAL atomic snapshot)') },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => showToastBanner('Saved copy as new sequence revision') },
      { label: 'Save a Copy...', shortcut: 'Ctrl+Alt+S', action: () => showToastBanner('Snapshot archived to backup scratch disk') },
      { label: 'Save as Template...', action: () => showToastBanner('Sequence saved to Starter Templates') },
      { label: 'Save All', action: () => showToastBanner('All open sequence manifests saved') },
      { label: 'Revert', action: () => showToastBanner('Reverted to last atomic snapshot') },
      { type: 'divider' },
      { label: 'Link Media...', disabled: true },
      { label: 'Make Offline...', disabled: true },
      { type: 'divider' },
      {
        label: 'ClipFlow Dynamic Link',
        hasSubmenu: true,
        submenu: [
          { label: 'New Neural Composition...', action: () => showToastBanner('Linked to Neural Motion Engine') },
          { label: 'Import WebGPU Canvas Node...', action: () => showToastBanner('Imported WebGPU shader node') },
        ],
      },
      { type: 'divider' },
      { label: 'Import from Media Browser', shortcut: 'Ctrl+Alt+I', disabled: true },
      { label: 'Import...', shortcut: 'Ctrl+I', action: () => showToastBanner('Importing media files...') },
      { label: 'Import Recent File', hasSubmenu: true, disabled: true },
      { label: 'Import Premiere Mobile Project', hasSubmenu: true, action: () => showToastBanner('Importing mobile project XML...') },
      { label: 'Create with AI Copilot...', action: () => openVoiceModal() },
      { label: 'Brainstorm in Neural Canvas...', action: () => showToastBanner('Opening Neural Storyboard Canvas...') },
      { label: 'Search Media Assets...', action: () => showToastBanner('Searching local media storage cache...') },
      { type: 'divider' },
      {
        label: 'Export',
        hasSubmenu: true,
        submenu: [
          { label: 'Media...', shortcut: 'Ctrl+M', action: () => openRenderProgressModal() },
          { label: 'Batch Render Queue...', shortcut: 'Ctrl+B', action: () => setBatchQueueOpen(true) },
          { label: 'Captions & Subtitles (.vtt)...', action: () => exportSubtitles('vtt') },
          { label: 'Subtitles (.srt)...', action: () => exportSubtitles('srt') },
          { label: 'Final Cut Pro XML / EDL...', action: () => showToastBanner('Exported FCP XML timeline conform') },
        ],
      },
      { type: 'divider' },
      {
        label: 'Get Media File Properties for',
        hasSubmenu: true,
        submenu: [
          { label: 'Selected Clip...', action: () => showToastBanner('Selected Clip: 3840×2160 ProRes 422 HQ 60fps') },
          { label: 'Active Sequence...', action: () => showToastBanner('Sequence: 4K UHD ACEScg Rec.709-A 60.00fps') },
        ],
      },
      { type: 'divider' },
      {
        label: 'Project Settings',
        hasSubmenu: true,
        submenu: [
          { label: 'General & Working Codec...', action: () => showToastBanner('Working Codec: Apple ProRes 422 HQ') },
          { label: 'Color Management (ACEScg)...', action: () => showToastBanner('Color Pipeline: ACEScg / Rec.709-A') },
          { label: 'Scratch Disks RAID-0...', action: () => showToastBanner('Scratch Disk: D:/Projects/ClipFlow/Cache') },
          { label: 'Ingest & Auto-Proxy Settings...', action: () => showToastBanner('Auto-proxy: ProRes Proxy 1080p') },
        ],
      },
      { label: 'Production Settings', disabled: true },
      { type: 'divider' },
      { label: 'Project Manager...', action: () => setWelcomeOpen(true) },
      { type: 'divider' },
      { label: 'Exit', shortcut: 'Ctrl+Q', action: () => showToastBanner('Exiting ClipFlow Studio. State saved to WAL.') },
    ],

    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', disabled: !canUndo, action: () => undo() },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', disabled: !canRedo, action: () => redo() },
      { type: 'divider' },
      {
        label: 'Cut',
        shortcut: 'Ctrl+X',
        disabled: !selectedClipId,
        action: () => {
          deleteSelectedClip();
          showToastBanner('Cut clip to clipboard');
        },
      },
      {
        label: 'Copy',
        shortcut: 'Ctrl+C',
        disabled: !selectedClipId,
        action: () => showToastBanner('Copied clip attributes to clipboard'),
      },
      {
        label: 'Paste',
        shortcut: 'Ctrl+V',
        action: () => showToastBanner('Pasted clip at playhead position'),
      },
      { label: 'Paste Insert', shortcut: 'Ctrl+Shift+V', disabled: true },
      { label: 'Paste Attributes...', shortcut: 'Ctrl+Alt+V', disabled: true },
      { label: 'Remove Attributes...', disabled: true },
      {
        label: 'Clear',
        shortcut: 'Delete',
        disabled: !selectedClipId,
        action: () => deleteSelectedClip(),
      },
      {
        label: 'Ripple Delete',
        shortcut: 'Shift+Delete',
        disabled: !selectedClipId,
        action: () => showToastBanner('Ripple deleted clip & closed gap across sync tracks'),
      },
      { type: 'divider' },
      { label: 'Duplicate', shortcut: 'Ctrl+Shift+/', disabled: true },
      {
        label: 'Select All',
        shortcut: 'Ctrl+A',
        disabled: false,
        action: () => {
          if (clips.length > 0) selectClip(clips[0].id);
          showToastBanner('Selected all clips in sequence');
        },
      },
      { label: 'Select All Matching', disabled: true },
      {
        label: 'Deselect All',
        shortcut: 'Ctrl+Shift+A',
        disabled: false,
        action: () => {
          selectClip(null);
          showToastBanner('Deselected all clips');
        },
      },
      { type: 'divider' },
      { label: 'Find...', shortcut: 'Ctrl+F', disabled: true },
      { label: 'Find Next', disabled: true },
      {
        label: 'Spelling',
        hasSubmenu: true,
        submenu: [
          { label: 'Check Spelling...', action: () => showToastBanner('Checking transcript and title spelling...') },
          { label: 'Spelling Settings...', action: () => showToastBanner('Spelling Language: English (US)') },
        ],
      },
      { type: 'divider' },
      {
        label: 'Label',
        hasSubmenu: true,
        disabled: !selectedClipId,
        submenu: [
          { label: 'Violet', action: () => showToastBanner('Label Color set to Violet') },
          { label: 'Iris', action: () => showToastBanner('Label Color set to Iris') },
          { label: 'Caribbean', action: () => showToastBanner('Label Color set to Caribbean') },
          { label: 'Lavender', action: () => showToastBanner('Label Color set to Lavender') },
          { label: 'Cerulean', action: () => showToastBanner('Label Color set to Cerulean') },
          { label: 'Forest', action: () => showToastBanner('Label Color set to Forest') },
          { label: 'Rose', action: () => showToastBanner('Label Color set to Rose') },
          { label: 'Mango', action: () => showToastBanner('Label Color set to Mango') },
          { label: 'Purple', action: () => showToastBanner('Label Color set to Purple') },
          { label: 'Blue', action: () => showToastBanner('Label Color set to Blue') },
          { label: 'Teal', action: () => showToastBanner('Label Color set to Teal') },
          { label: 'Magenta', action: () => showToastBanner('Label Color set to Magenta') },
          { label: 'Tan', action: () => showToastBanner('Label Color set to Tan') },
          { label: 'Green', action: () => showToastBanner('Label Color set to Green') },
          { label: 'Brown', action: () => showToastBanner('Label Color set to Brown') },
          { label: 'Yellow', action: () => showToastBanner('Label Color set to Yellow') },
        ],
      },
      { type: 'divider' },
      { label: 'Remove Unused', disabled: true },
      {
        label: 'Consolidate Duplicates',
        disabled: false,
        action: () => showToastBanner('Consolidated duplicate footage assets in Media Bin'),
      },
      { label: 'Generate Source Clips for Media', disabled: true },
      { label: 'Reassociate Source Clips...', disabled: true },
      { type: 'divider' },
      {
        label: 'Team Project',
        hasSubmenu: true,
        submenu: [
          { label: 'Get Latest Changes', action: () => showToastBanner('Team Project: Up to date with master branch') },
          { label: 'Share My Changes...', action: () => showToastBanner('Team Project: Shared sequence changes') },
          { label: 'Resolve Conflicts...', action: () => showToastBanner('No sync conflicts detected') },
          { type: 'divider' },
          { label: 'Convert to Team Project...', action: () => showToastBanner('Converting local SQLite manifest to cloud team sequence...') },
        ],
      },
      { type: 'divider' },
      { label: 'Edit Original', shortcut: 'Ctrl+E', disabled: true },
      {
        label: 'Edit in Adobe Audition',
        hasSubmenu: true,
        disabled: true,
        submenu: [
          { label: 'Extract Audio to Audition...' },
        ],
      },
      { label: 'Edit in Adobe Photoshop', disabled: true },
      { type: 'divider' },
      {
        label: 'Keyboard Shortcuts...',
        shortcut: 'Ctrl+Alt+K',
        action: () => showToastBanner('Keyboard Shortcuts: Space (Play/Pause), J-K-L, C (Razor), V (Select), Del (Clear)'),
      },
      {
        label: 'Preferences',
        hasSubmenu: true,
        submenu: [
          { label: 'General...', action: () => showToastBanner('Preferences: General Settings') },
          { label: 'Appearance...', action: () => showToastBanner('Preferences: Appearance & Themes') },
          { label: 'Audio...', action: () => showToastBanner('Preferences: Audio Sample Rate 48kHz') },
          { label: 'Audio Hardware...', action: () => showToastBanner('Preferences: CoreAudio / ASIO sub-16ms') },
          { label: 'Auto Save...', action: () => showToastBanner('Preferences: Auto-Save every 30s (WAL mode)') },
          { label: 'Collaboration...', action: () => showToastBanner('Preferences: Team Sequence Locking') },
          { label: 'Color...', action: () => showToastBanner('Preferences: ACEScg / Rec.709-A') },
          { label: 'Media...', action: () => showToastBanner('Preferences: Hardware Decoding Metal/NVENC') },
          { label: 'Media Cache...', action: () => showToastBanner('Preferences: Scratch Disk Cache Management') },
          { label: 'Memory & Performance...', action: () => showToastBanner('Preferences: 32 GB RAM allocated to rendering') },
          { label: 'Playback...', action: () => showToastBanner('Preferences: 60 FPS drop-frame compensation') },
          { label: 'Timeline...', action: () => showToastBanner('Preferences: Snap threshold 5 frames') },
          { label: 'Trim...', action: () => showToastBanner('Preferences: Dynamic Ripple Trimming') },
        ],
      },
    ],

    Clip: [
      { label: 'Split at Playhead (Razor)', shortcut: 'C', action: () => splitClipAtPlayhead() },
      { label: 'Speed / Duration...', shortcut: 'Ctrl+R', action: () => showToastBanner('Speed: 100% (Optical Flow Frame Interpolation)') },
      { label: 'Enable / Disable', shortcut: 'V', action: () => showToastBanner('Clip visibility toggled') },
      { label: 'Link Audio and Video', shortcut: 'Ctrl+L', action: () => showToastBanner('Linked A/V tracks') },
      { type: 'divider' },
      { label: 'Audio Gain...', shortcut: 'G', action: () => showToastBanner('Adjust Audio Gain (+0.0 dB)') },
      { label: 'Spectral Voice Isolation', action: () => showToastBanner('Applied Neural Voice Isolation (-18 dB)') },
      { label: 'Automatic Ducking', action: () => showToastBanner('Music Bed auto-ducked against dialogue') },
      { type: 'divider' },
      { label: 'Generate Optical Flow Vectors', action: () => showToastBanner('Synthesized 60 FPS Optical Flow') },
      { label: 'Auto Color Match to Reference', action: () => showToastBanner('Matched skin tones to reference shot') },
    ],

    Sequence: [
      { label: 'Render In to Out', shortcut: 'Return', action: () => openRenderProgressModal() },
      { label: 'Render Selection', action: () => openRenderProgressModal() },
      { label: 'Delete Render Files', action: () => showToastBanner('Scratch render preview cache cleared') },
      { type: 'divider' },
      { label: 'Match Frame', shortcut: 'F', action: () => showToastBanner('Matched Source Monitor frame') },
      { label: 'Reverse Match Frame', shortcut: 'Shift+R', action: () => showToastBanner('Reverse matched sequence frame') },
      { type: 'divider' },
      { label: 'Apply AI Silence Cuts', shortcut: 'Alt+Del', action: () => showToastBanner('Applied 5 detected silence ripple cuts') },
      { label: 'Close Gap', action: () => showToastBanner('Closed track gap') },
      { label: 'Sequence Settings...', action: () => showToastBanner('Sequence: 3840×2160 60.00fps ACEScg') },
    ],

    Markers: [
      { label: 'Add Marker', shortcut: 'M', action: () => showToastBanner('Added Marker at current timecode') },
      { label: 'Mark In', shortcut: 'I', action: () => setInPoint() },
      { label: 'Mark Out', shortcut: 'O', action: () => setOutPoint() },
      { label: 'Mark Clip', shortcut: 'X', action: () => showToastBanner('Marked In/Out to selected clip duration') },
      { type: 'divider' },
      { label: 'Clear In and Out', shortcut: 'Ctrl+Shift+X', action: () => clearInOut() },
      { label: 'Clear In', shortcut: 'Alt+I', action: () => clearInOut() },
      { label: 'Clear Out', shortcut: 'Alt+O', action: () => clearInOut() },
      { label: 'Clear All Markers', action: () => showToastBanner('All sequence markers cleared') },
    ],

    'Graphics and Titles': [
      { label: 'New Text Layer', shortcut: 'Ctrl+T', action: () => showToastBanner('Created New Text Layer on V2') },
      { label: 'Upgrade to Motion Graphic Template...', action: () => showToastBanner('Exported MOGRT asset') },
      { label: 'Install Motion Graphics Template...', action: () => showToastBanner('Installed .mogrt pack') },
      { type: 'divider' },
      { label: 'Burn-in Open Captions (CC1)', action: () => showToastBanner('Open captions burned into video preview') },
      { label: 'Sync Diarized Transcript', action: () => showToastBanner('Resynced word-level timestamps') },
    ],

    View: [
      { label: 'Safe Margins (90% / 80%)', action: () => showToastBanner('Toggled Safe Margins overlay') },
      { label: 'Snapping', shortcut: 'S', action: () => showToastBanner('Timeline snapping enabled') },
      { label: 'Show Audio Waveforms', action: () => showToastBanner('Waveforms rendered on audio tracks') },
      { label: 'Show Filmstrip Thumbnails', action: () => showToastBanner('Filmstrip thumbnails displayed') },
      { type: 'divider' },
      { label: 'Zoom In', shortcut: '=', action: () => showToastBanner('Zoomed in timeline') },
      { label: 'Zoom Out', shortcut: '-', action: () => showToastBanner('Zoomed out timeline') },
      { label: 'Zoom to Sequence Fit', shortcut: '\\', action: () => showToastBanner('Timeline zoomed to fit all clips') },
    ],

    Window: [
      { label: 'Workspaces', hasSubmenu: true, submenu: [
        { label: 'Editing', action: () => setActiveWorkspace('editing') },
        { label: 'Color (Lumetri)', action: () => setActiveWorkspace('color') },
        { label: 'Audio (Fairlight / Mixer)', action: () => setActiveWorkspace('audio') },
        { label: 'Graphics & Titles', action: () => setActiveWorkspace('graphics') },
        { type: 'divider' },
        { label: 'Reset to Saved Layout', action: () => showToastBanner('Layout restored to default') },
      ]},
      { type: 'divider' },
      { label: 'Media Bin / Assets', action: () => showToastBanner('Media Bin focused') },
      { label: 'Program Monitor', action: () => showToastBanner('Program Monitor focused') },
      { label: 'Timeline Tracks', action: () => showToastBanner('Timeline tracks focused') },
      { label: 'Lumetri Color Wheels', action: () => setActiveWorkspace('color') },
      { label: 'Interactive Transcript & Diarization', action: () => showToastBanner('Transcript dock focused') },
      { label: 'AI Silence Telemetry Studio', action: () => openVoiceModal() },
      { label: 'Batch Render Queue', action: () => setBatchQueueOpen(true) },
    ],

    Help: [
      { label: 'ClipFlow Studio 2.1.0 Documentation', action: () => showToastBanner('Opening Documentation Manual') },
      { label: 'Keyboard Shortcuts Cheat Sheet', shortcut: 'Ctrl+Alt+K', action: () => showToastBanner('Shortcuts: J-K-L, Space, I, O, C, V, M, Del') },
      { label: 'Release Notes & Neural Model Status', action: () => showToastBanner('WebGPU / CoreML Neural Models: 120 FPS Ready') },
      { type: 'divider' },
      { label: 'Check for Updates...', action: () => showToastBanner('ClipFlow Studio v2.1.0 is up to date') },
      { label: 'About ClipFlow Studio...', action: () => setWelcomeOpen(true) },
    ],
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
    setActiveSubmenu(null);
  };

  const handleSubmenuEnter = (label: string) => {
    setActiveSubmenu(label);
  };

  const closeAllMenus = () => {
    setActiveMenu(null);
    setActiveSubmenu(null);
  };

  const workspaces: { id: WorkspaceLayout; label: string }[] = [
    { id: 'editing', label: 'Editing' },
    { id: 'color', label: 'Color' },
    { id: 'audio', label: 'Audio' },
    { id: 'graphics', label: 'Graphics' },
  ];

  return (
    <header className="relative z-50 flex items-center justify-between px-2 h-9 w-full bg-nle-header border-b border-nle-border text-xs select-none">
      {/* Left: App Logo, Home Icon, Menu Bar */}
      <div ref={menuBarRef} className="flex items-center gap-1">
        {/* Home / Projects Dashboard Button */}
        <button
          onClick={() => setWelcomeOpen(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-nle-panel text-nle-text transition-colors"
          title="Open Project Dashboard (Ctrl+O)"
        >
          <span className="material-symbols-outlined text-[17px] text-nle-accent">movie_filter</span>
          <span className="font-bold tracking-tight text-white text-[12px] hidden md:inline">
            ClipFlow <span className="text-nle-accent font-mono text-[9px]">2.1</span>
          </span>
        </button>

        <div className="h-3.5 w-[1px] bg-nle-border mx-1" />

        {/* Global Menu Bar Items */}
        <div className="relative flex items-center">
          {Object.keys(menuDefinitions).map((menuName) => {
            const isMenuOpen = activeMenu === menuName;
            return (
              <div key={menuName} className="relative">
                <button
                  onClick={() => handleMenuClick(menuName)}
                  onMouseEnter={() => activeMenu && handleMenuClick(menuName)}
                  className={`px-2 py-1 rounded text-[11px] font-normal transition-colors ${
                    isMenuOpen ? 'bg-nle-border text-white font-medium' : 'text-nle-dim hover:text-white hover:bg-nle-panel'
                  }`}
                >
                  {menuName}
                </button>

                {/* Dropdown Menu Window */}
                {isMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-0.5 w-64 py-1 bg-[#18181b] border border-[#27272a] rounded shadow-2xl z-50 text-[11px] animate-in fade-in duration-75"
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    {menuDefinitions[menuName].map((item, idx) => {
                      if (item.type === 'divider') {
                        return <div key={`div-${idx}`} className="h-[1px] bg-[#27272a] my-1" />;
                      }

                      const isDisabled = !!item.disabled;
                      const hasSub = !!item.hasSubmenu;
                      const isSubOpen = activeSubmenu === item.label;

                      return (
                        <div
                          key={`item-${idx}`}
                          className="relative"
                          onMouseEnter={() => hasSub && handleSubmenuEnter(item.label!)}
                        >
                          <button
                            disabled={isDisabled}
                            onClick={() => {
                              if (!hasSub && item.action) {
                                item.action();
                                closeAllMenus();
                              }
                            }}
                            className={`w-full px-3 py-1 flex items-center justify-between text-left transition-colors ${
                              isDisabled
                                ? 'text-[#71717a] cursor-default'
                                : isSubOpen
                                ? 'bg-nle-accent/20 text-white font-medium'
                                : 'text-[#f4f4f5] hover:bg-nle-panel hover:text-white'
                            }`}
                          >
                            <span className="truncate">{item.label}</span>

                            <div className="flex items-center gap-2">
                              {item.shortcut && (
                                <span className="text-3xs text-[#a1a1aa] font-mono tracking-wider">
                                  {item.shortcut}
                                </span>
                              )}
                              {hasSub && (
                                <span className="text-3xs text-[#71717a] font-mono leading-none">
                                  ›
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Flyout Submenu */}
                          {hasSub && isSubOpen && item.submenu && (
                            <div className="absolute left-full top-0 ml-0.5 w-56 py-1 bg-[#18181b] border border-[#27272a] rounded shadow-2xl z-50 text-[11px] animate-in fade-in duration-75">
                              {item.submenu.map((sub, sIdx) => {
                                if (sub.type === 'divider') {
                                  return <div key={`sdiv-${sIdx}`} className="h-[1px] bg-[#27272a] my-1" />;
                                }
                                return (
                                  <button
                                    key={`sitem-${sIdx}`}
                                    onClick={() => {
                                      if (sub.action) sub.action();
                                      closeAllMenus();
                                    }}
                                    className="w-full px-3 py-1 flex items-center justify-between text-left text-[#f4f4f5] hover:bg-nle-panel hover:text-white transition-colors"
                                  >
                                    <span className="truncate">{sub.label}</span>
                                    {sub.shortcut && (
                                      <span className="text-3xs text-[#a1a1aa] font-mono tracking-wider">
                                        {sub.shortcut}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-3.5 w-[1px] bg-nle-border mx-1 hidden xl:block" />

        {/* Project Name and Auto-Saved Status */}
        <div className="hidden xl:flex items-center gap-2">
          <span className="font-mono text-[11px] text-nle-text font-semibold max-w-[180px] truncate" title={projectName}>
            {projectName}
          </span>
          <span className="flex items-center gap-1 text-[9px] text-nle-emerald font-mono bg-nle-emerald/10 border border-nle-emerald/20 px-1.5 py-0.2 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-nle-emerald animate-pulse" />
            Auto-Saved
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
            <span className="material-symbols-outlined text-[15px]">undo</span>
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
            <span className="material-symbols-outlined text-[15px]">redo</span>
          </button>
        </div>

        {/* AI Copilot Studio Quick Trigger */}
        <button
          onClick={openVoiceModal}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-nle-accent/10 border border-nle-accent/40 text-nle-accent hover:bg-nle-accent/20 transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)]"
          title="Open AI Copilot & Voice Telemetry"
        >
          <span className="material-symbols-outlined text-[15px] animate-pulse">auto_awesome</span>
          <span className="hidden sm:inline font-semibold text-[11px]">AI Copilot</span>
        </button>

        {/* Batch Queue Button */}
        <button
          onClick={() => setBatchQueueOpen(true)}
          className="p-1 rounded bg-nle-canvas hover:bg-nle-panel border border-nle-border text-nle-dim hover:text-nle-text transition-colors"
          title="Batch Render Queue (Ctrl+B)"
        >
          <span className="material-symbols-outlined text-[15px]">queue_play_next</span>
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-1 rounded bg-nle-canvas hover:bg-nle-panel border border-nle-border text-nle-dim hover:text-nle-text transition-colors"
          title={themeMode === 'dark' ? 'Switch to Editorial Light Mode' : 'Switch to Studio Dark Mode'}
        >
          <span className="material-symbols-outlined text-[15px]">
            {themeMode === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Export Button */}
        <button
          onClick={openRenderProgressModal}
          className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-nle-blue hover:bg-nle-blue/90 text-white font-semibold text-[11px] shadow-[0_0_12px_rgba(13,153,255,0.3)] active:scale-95 transition-all"
          title="Export Sequence Master (Ctrl+M)"
        >
          <span className="material-symbols-outlined text-[15px]">ios_share</span>
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
