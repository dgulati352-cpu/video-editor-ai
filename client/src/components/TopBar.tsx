import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { WorkspaceLayout } from '../types';
import { secondsToSMPTE } from '../utils/timecode';

interface MenuItem {
  type?: 'item' | 'divider';
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
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
    timelineZoom,
    setTimelineZoom,
    snappingEnabled,
    toggleSnapping,
    toggleSafeMargins,
    isSafeMarginsActive,
    quickSocialReframe,
    quickAutoSubtitles,
    quickAutoCutSilence,
    quickAutoColorMatch,
    quickVoiceIsolation,
    setCurrentTime,
    inPoint,
    outPoint,
    isMediaBinOpen,
    toggleMediaBin,
    isInspectorOpen,
    toggleInspector,
    toggleKeyboardHelp,
    resetToNewProject,
    loadDemoProject,
    importSampleAssets,
  } = useTimelineStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const menuBarRef = useRef<HTMLDivElement | null>(null);
  const workspaceDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target as Node)) {
        setIsWorkspaceMenuOpen(false);
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
          { label: 'Project...', shortcut: 'Ctrl+Alt+N', action: resetToNewProject },
          { label: 'Production...' },
          { label: 'Sequence...', shortcut: 'Ctrl+N', action: () => showToastBanner('Created New Sequence: Sequence 01') },
          { label: 'Load Demo Sequence...', action: loadDemoProject },
          { label: 'Bin', shortcut: 'Ctrl+/' },
          { label: 'Search Bin...' },
          { type: 'divider' },
          { label: 'Adjustment Layer...' },
          { label: 'Color Matte...' },
          { label: 'Bars and Tone...' },
          { label: 'Black Video...' },
          { label: 'Captions...' },
        ],
      },
      { label: 'Open Project...', shortcut: 'Ctrl+O', action: () => setWelcomeOpen(true) },
      { label: 'Open Production...', disabled: true },
      { label: 'Open Team Project...', disabled: true },
      {
        label: 'Open Recent',
        hasSubmenu: true,
        submenu: recentProjects.map((p) => ({
          label: p.name,
          action: () => showToastBanner(`Opened Project: ${p.name}`),
        })),
      },
      { type: 'divider' },
      { label: 'Close', shortcut: 'Ctrl+W', action: resetToNewProject },
      { label: 'Close Project', shortcut: 'Ctrl+Shift+W', action: resetToNewProject },
      { label: 'Close Production', disabled: true },
      { label: 'Close All Projects', action: resetToNewProject },
      { label: 'Close All Other Projects', disabled: true },
      { label: 'Refresh All Projects', disabled: true },
      { label: 'Save', shortcut: 'Ctrl+S', action: () => showToastBanner(`Project saved to Local Storage: ${projectName}`) },
      { label: 'Import Audio / Media...', shortcut: 'Ctrl+I', action: openVoiceModal },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => showToastBanner('Save As... project dialog') },
      { label: 'Save a Copy...', shortcut: 'Ctrl+Alt+S' },
      { label: 'Reset to Clean Slate (Clear Local Storage)', action: () => { localStorage.removeItem('clipflow_studio_project_storage'); resetToNewProject(); } },
      { label: 'Revert', action: () => showToastBanner('Reverted from Local Storage') },
      { type: 'divider' },
      { label: 'Link Media...', disabled: true },
      { label: 'Make Offline...', disabled: true },
      { type: 'divider' },
      { label: 'Adobe Dynamic Link', hasSubmenu: true, disabled: true },
      { type: 'divider' },
      { label: 'Import from Media Browser', shortcut: 'Ctrl+Alt+I', disabled: true },
      { label: 'Import...', shortcut: 'Ctrl+I', action: importSampleAssets },
      { label: 'Import Recent File', hasSubmenu: true, disabled: true },
      { label: 'Import Premiere Mobile Project', hasSubmenu: true },
      { label: 'Create in Adobe Firefly...', action: openVoiceModal },
      { label: 'Brainstorm in Adobe Firefly Boards...', action: openVoiceModal },
      { label: 'Search Adobe Stock...' },
      { type: 'divider' },
      {
        label: 'Export',
        hasSubmenu: true,
        submenu: [
          { label: 'Media...', shortcut: 'Ctrl+M', action: openRenderProgressModal },
          { label: 'Subtitles (SRT / VTT)...', action: () => exportSubtitles('srt') },
          { label: 'AAF / XML Interchange...' },
          { label: 'Batch Queue...', shortcut: 'Ctrl+B', action: () => setBatchQueueOpen(true) },
        ],
      },
      { type: 'divider' },
      { label: 'Get Media File Properties for', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Project Settings', hasSubmenu: true },
      { label: 'Production Settings', disabled: true },
      { type: 'divider' },
      { label: 'Project Manager...' },
      { type: 'divider' },
      { label: 'Exit', shortcut: 'Ctrl+Q', action: () => setWelcomeOpen(true) },
    ],

    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', disabled: !canUndo, action: undo },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', disabled: !canRedo, action: redo },
      { type: 'divider' },
      { label: 'Cut', shortcut: 'Ctrl+X', disabled: !selectedClipId },
      { label: 'Copy', shortcut: 'Ctrl+C', disabled: !selectedClipId },
      { label: 'Paste', shortcut: 'Ctrl+V' },
      { label: 'Paste Insert', shortcut: 'Ctrl+Shift+V', disabled: true },
      { label: 'Paste Attributes...', shortcut: 'Ctrl+Alt+V', disabled: true },
      { label: 'Remove Attributes...', disabled: true },
      { label: 'Clear', shortcut: 'Delete', disabled: !selectedClipId, action: deleteSelectedClip },
      { label: 'Ripple Delete', shortcut: 'Shift+Delete', disabled: true },
      { type: 'divider' },
      { label: 'Duplicate', shortcut: 'Ctrl+Shift+/' },
      { label: 'Select All', shortcut: 'Ctrl+A', action: () => clips[0] && selectClip(clips[0].id) },
      { label: 'Select All Matching' },
      { label: 'Deselect All', shortcut: 'Ctrl+Shift+A', action: () => selectClip(null) },
      { type: 'divider' },
      { label: 'Find...', shortcut: 'Ctrl+F' },
      { label: 'Find Next', disabled: true },
      { label: 'Spelling', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Label', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Remove Unused', disabled: true },
      { label: 'Consolidate Duplicates' },
      { label: 'Generate Source Clips for Media', disabled: true },
      { label: 'Reassociate Source Clips...', disabled: true },
      { type: 'divider' },
      { label: 'Team Project', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Edit Original', shortcut: 'Ctrl+E', disabled: true },
      { label: 'Edit in Adobe Audition', hasSubmenu: true, disabled: true },
      { label: 'Edit in Adobe Photoshop', disabled: true },
      { type: 'divider' },
      { label: 'Keyboard Shortcuts...', shortcut: 'Ctrl+Alt+K', action: toggleKeyboardHelp },
      {
        label: 'Preferences',
        hasSubmenu: true,
        submenu: [
          { label: 'General...' },
          { label: 'Appearance...' },
          { label: 'Audio Hardware...' },
          { label: 'Auto Save...' },
          { label: 'Color Management (ACEScg / Rec.709-A)...' },
          { label: 'Media Cache...' },
          { label: 'Timeline...' },
        ],
      },
    ],

    Clip: [
      { label: 'Rename...', disabled: true },
      { label: 'Make Subclip...', shortcut: 'Ctrl+U', disabled: true },
      { label: 'Edit Subclip...', disabled: true },
      { label: 'Edit Offline...', disabled: true },
      { label: 'Source Settings...', disabled: true },
      { type: 'divider' },
      { label: 'Modify', hasSubmenu: true },
      { label: 'Video Options', hasSubmenu: true },
      { label: 'Audio Options', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Speed/Duration...', shortcut: 'Ctrl+R', disabled: !selectedClipId },
      { label: 'Scene Edit Detection...', disabled: true },
      { label: 'Enable Enhance Speech', action: quickVoiceIsolation },
      { label: 'Remix', hasSubmenu: true, disabled: true },
      { type: 'divider' },
      { label: 'Insert', shortcut: ',', disabled: true },
      { label: 'Overwrite', shortcut: '.', disabled: true },
      { type: 'divider' },
      { label: 'Replace Footage...', disabled: true },
      { label: 'Replace With Clip', hasSubmenu: true, disabled: true },
      { label: 'Render and Replace...', disabled: true },
      { label: 'Restore Unrendered', disabled: true },
      { label: 'Restore Captions from Source Clip', disabled: true },
      { label: 'Update Metadata...', disabled: true },
      { type: 'divider' },
      { label: 'Generate Audio Waveform', disabled: true },
      { label: 'Auto-Tag Audio Types', disabled: true },
      { type: 'divider' },
      { label: 'Automate to Sequence...', disabled: true },
      { type: 'divider' },
      { label: 'Enable', shortcut: 'Shift+E' },
      { label: 'Link', shortcut: 'Ctrl+L' },
      { label: 'Group', shortcut: 'Ctrl+G' },
      { label: 'Ungroup', shortcut: 'Ctrl+Shift+G' },
      { label: 'Synchronize...', disabled: true },
      { label: 'Merge Clips...', disabled: true },
      { label: 'Nest...' },
      { label: 'Create Multi-Camera Source Sequence...', disabled: true },
      { label: 'Multi-Camera', hasSubmenu: true, disabled: true },
    ],

    Sequence: [
      { label: 'Sequence Settings...', disabled: true },
      { type: 'divider' },
      { label: 'Render Effects in Work Area', shortcut: 'Enter', action: openRenderProgressModal },
      { label: 'Render Entire Work Area', action: openRenderProgressModal },
      { label: 'Render Selection', disabled: true },
      { label: 'Render Audio', action: openRenderProgressModal },
      { label: 'Delete Render Files', disabled: true },
      { label: 'Delete Work Area Render Files', disabled: true },
      { type: 'divider' },
      { label: 'Match Frame', shortcut: 'F' },
      { label: 'Reverse Match Frame', shortcut: 'Shift+R' },
      { type: 'divider' },
      { label: 'Add Edit', shortcut: 'Ctrl+K', action: splitClipAtPlayhead },
      { label: 'Add Edit to All Tracks', shortcut: 'Ctrl+Shift+K', action: splitClipAtPlayhead },
      { label: 'Trim Edit', shortcut: 'Shift+T' },
      { label: 'Extend Selected Edit to Playhead', shortcut: 'E' },
      { type: 'divider' },
      { label: 'Apply Video Transition', shortcut: 'Ctrl+D' },
      { label: 'Apply Audio Transition', shortcut: 'Ctrl+Shift+D' },
      { label: 'Apply Default Transitions to Selection', shortcut: 'Shift+D' },
      { type: 'divider' },
      { label: 'Lift', shortcut: ';' },
      { label: 'Extract', shortcut: '\'' },
      { type: 'divider' },
      { label: 'Zoom In', shortcut: '=', action: () => setTimelineZoom(timelineZoom + 15) },
      { label: 'Zoom Out', shortcut: '-', action: () => setTimelineZoom(timelineZoom - 15) },
      { type: 'divider' },
      { label: 'Close Gap', action: quickAutoCutSilence },
      { label: 'Go to Gap', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Snap in Timeline', shortcut: 'S', checked: snappingEnabled, action: toggleSnapping },
      { label: 'Linked Selection', checked: true },
      { label: 'Selection Follows Playhead', checked: true },
      { label: 'Show Through Edits', checked: true },
      { type: 'divider' },
      { label: 'Normalize Mix Track...', disabled: true },
      { type: 'divider' },
      { label: 'Make Subsequence', shortcut: 'Shift+U' },
      { type: 'divider' },
      { label: 'Auto Reframe Sequence...', action: quickSocialReframe },
      { label: 'Transcribe Sequence...', action: quickAutoSubtitles },
      { label: 'Simplify Sequence...' },
      { type: 'divider' },
      { label: 'Add Audio / Music Track...', action: openVoiceModal },
      { label: 'Add Tracks...' },
      { label: 'Delete Tracks...' },
      { type: 'divider' },
      { label: 'Captions', hasSubmenu: true },
    ],

    Markers: [
      { label: 'Mark In', shortcut: 'I', action: setInPoint },
      { label: 'Mark Out', shortcut: 'O', action: setOutPoint },
      { label: 'Mark Clip', shortcut: 'X' },
      { label: 'Mark Selection', shortcut: '/' },
      { label: 'Mark Split', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Go to In', shortcut: 'Shift+I', action: () => inPoint !== null && setCurrentTime(inPoint) },
      { label: 'Go to Out', shortcut: 'Shift+O', action: () => outPoint !== null && setCurrentTime(outPoint) },
      { label: 'Go to Split', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Clear In', shortcut: 'Ctrl+Shift+I', action: clearInOut },
      { label: 'Clear Out', shortcut: 'Ctrl+Shift+O', action: clearInOut },
      { label: 'Clear In and Out', shortcut: 'Ctrl+Shift+X', action: clearInOut },
      { type: 'divider' },
      { label: 'Add Marker', shortcut: 'M', action: () => showToastBanner(`Marker added at ${secondsToSMPTE(currentTime, frameRate)}`) },
      { label: 'Add Range Marker', shortcut: 'Ctrl+Alt+Shift+N' },
      { label: 'Add Range Marker to In and Out', shortcut: 'Alt+Shift+N' },
      { label: 'Go to Next Marker', shortcut: 'Shift+M' },
      { label: 'Go to Previous Marker', shortcut: 'Ctrl+Shift+M' },
      { type: 'divider' },
      { label: 'Clear Selected Marker', shortcut: 'Ctrl+Alt+M' },
      { label: 'Clear Markers', shortcut: 'Ctrl+Alt+Shift+M' },
      { label: 'Show All Marker Colors' },
      { type: 'divider' },
      { label: 'Edit Marker...' },
      { type: 'divider' },
      { label: 'Add Chapter Marker...' },
      { label: 'Add Flash Cue Marker...' },
      { type: 'divider' },
      { label: 'Ripple Sequence Markers' },
      { label: 'Copy Paste Includes Sequence Markers' },
    ],

    'Graphics and Titles': [
      { label: 'Add Fonts from Adobe Fonts...' },
      { label: 'Install Motion Graphics Template...' },
      { type: 'divider' },
      { label: 'New Layer', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Align to Video Frame', hasSubmenu: true },
      { label: 'Align to Video Frame as Group', hasSubmenu: true },
      { label: 'Align to Selection', hasSubmenu: true },
      { label: 'Distribute', hasSubmenu: true },
      { label: 'Arrange', hasSubmenu: true },
      { label: 'Select', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Upgrade to Source Graphic', disabled: true },
      { label: 'Upgrade Caption to Graphic', disabled: true },
      { label: 'Reset All Parameters', disabled: true },
      { label: 'Reset Duration', disabled: true },
      { type: 'divider' },
      { label: 'Export As Motion Graphics Template...', disabled: true },
      { type: 'divider' },
      { label: 'Replace Fonts in Projects...' },
    ],

    View: [
      { label: 'Playback Resolution', hasSubmenu: true },
      { label: 'Paused Resolution', hasSubmenu: true, disabled: true },
      { label: 'High Quality Playback', disabled: true },
      { type: 'divider' },
      { label: 'Display Mode', hasSubmenu: true },
      { label: 'Magnification', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Show Rulers', disabled: true },
      { label: 'Show Guides', disabled: true },
      { label: 'Lock Guides', disabled: true },
      { label: 'Add Guide...', disabled: true },
      { label: 'Clear Guides', disabled: true },
      { type: 'divider' },
      { label: 'Snap in Program Monitor', disabled: true },
      { type: 'divider' },
      { label: 'Guide Templates', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Dynamic Audio Waveforms', checked: true },
      { label: 'Safe Margins', checked: isSafeMarginsActive, action: toggleSafeMargins },
    ],

    Window: [
      {
        label: 'Workspaces',
        hasSubmenu: true,
        submenu: [
          { label: 'Learning', action: () => setActiveWorkspace('editing') },
          { label: 'Editing', action: () => setActiveWorkspace('editing') },
          { label: 'Color', action: () => setActiveWorkspace('color') },
          { label: 'Audio', action: () => setActiveWorkspace('audio') },
          { label: 'Graphics', action: () => setActiveWorkspace('graphics') },
          { type: 'divider' },
          { label: 'Reset to Saved Layout', action: () => showToastBanner('Workspace layout reset') },
        ],
      },
      { label: 'Find Extensions on Exchange...', disabled: true },
      { type: 'divider' },
      { label: 'Extensions', hasSubmenu: true },
      { label: 'UXP Plugins', hasSubmenu: true },
      { type: 'divider' },
      { label: 'Maximize Frame', shortcut: 'Shift+`' },
      { type: 'divider' },
      { label: 'Audio Clip Effect Editor', disabled: true },
      { label: 'Audio Track Effect Editor', disabled: true },
      { type: 'divider' },
      { label: 'Adobe Stock' },
      { label: 'Audio Clip Mixer', shortcut: 'Shift+9' },
      { label: 'Audio Meters', checked: true },
      { label: 'Audio Track Mixer', shortcut: 'Shift+6' },
      { label: 'Effect Controls', shortcut: 'Shift+5' },
      { label: 'Effects', shortcut: 'Shift+7' },
      { label: 'Essential Sound' },
      { label: 'Events' },
      { label: 'Frame.io', hasSubmenu: true },
      { label: 'Graphics Templates' },
      { label: 'History' },
      { label: 'Info' },
      { label: 'Learn', checked: true },
      { label: 'Libraries' },
      { label: 'Lumetri Color' },
      { label: 'Lumetri Scopes' },
      { label: 'Markers' },
      { label: 'Media Browser', shortcut: 'Shift+8', checked: true },
      { label: 'Metadata' },
      { label: 'Production' },
      { label: 'Program Monitor', shortcut: 'Shift+4', checked: true },
      { label: 'Progress' },
      { label: 'Projects', hasSubmenu: true },
      { label: 'Properties', checked: isInspectorOpen, action: toggleInspector },
      { label: 'Search' },
      { label: 'Sequence Index' },
      { label: 'Source Monitor', shortcut: 'Shift+2', checked: true },
      { label: 'Text' },
      { label: 'Timecode' },
      { label: 'Timeline', shortcut: 'Shift+3', checked: true },
      { label: 'Tools', checked: true },
    ],

    Help: [
      { label: 'Premiere Pro Help...', shortcut: 'F1' },
      { label: 'ClipFlow 2.1 Documentation...', action: () => showToastBanner('ClipFlow Studio v2.1.0 Docs') },
      { label: 'Keyboard Shortcuts...', shortcut: '?', action: toggleKeyboardHelp },
      { type: 'divider' },
      { label: 'AI Copilot & Neural Pipeline Telemetry...', action: openVoiceModal },
      { label: 'Silence Removal Automation Guide...', action: quickAutoCutSilence },
      { type: 'divider' },
      { label: 'About Adobe Premiere Pro...', action: () => setWelcomeOpen(true) },
    ],
  };

  const handleMenuClick = (menuName: string) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
      setActiveSubmenu(null);
    } else {
      setActiveMenu(menuName);
      setActiveSubmenu(null);
    }
  };

  const handleSubmenuEnter = (itemLabel: string) => {
    setActiveSubmenu(itemLabel);
  };

  const closeAllMenus = () => {
    setActiveMenu(null);
    setActiveSubmenu(null);
  };

  const workspacesList: { id: WorkspaceLayout; label: string }[] = [
    { id: 'editing', label: 'LEARNING' },
    { id: 'editing', label: 'EDITING' },
    { id: 'color', label: 'COLOR' },
    { id: 'audio', label: 'AUDIO' },
    { id: 'graphics', label: 'GRAPHICS' },
  ];

  return (
    <div className="flex flex-col w-full select-none shrink-0 z-50">
      {/* ============================================================ */}
      {/* TIER 1: Windows OS Title Bar (Matching Real Premiere Pro)     */}
      {/* ============================================================ */}
      <div className="h-6 bg-[#1a1a1a] border-b border-[#2d2d2d] flex items-center justify-between px-2 text-[11px] text-[#a0a0a0]">
        <div className="flex items-center gap-2 truncate">
          {/* Authentic Adobe Premiere "Pr" Logo Icon */}
          <div className="w-4 h-4 rounded-[2px] bg-[#00005b] text-[#8ea4ff] font-bold text-[9px] flex items-center justify-center leading-none shadow-sm">
            Pr
          </div>
          <span className="truncate tracking-tight font-sans text-[#b0b0b0]">
            Adobe Premiere - C:\Users\DHAIRYA GULATI\Documents\Adobe\Premiere Pro\26.0\{projectName.replace('.cfs', '')} *
          </span>
        </div>

        {/* Windows Standard Window Controls */}
        <div className="flex items-center">
          <button
            className="w-8 h-6 flex items-center justify-center hover:bg-[#2d2d2d] text-[#a0a0a0] hover:text-white transition-colors"
            title="Minimize"
          >
            <span className="text-[10px]">🗕</span>
          </button>
          <button
            className="w-8 h-6 flex items-center justify-center hover:bg-[#2d2d2d] text-[#a0a0a0] hover:text-white transition-colors"
            title="Maximize"
          >
            <span className="text-[10px]">🗖</span>
          </button>
          <button
            onClick={() => setWelcomeOpen(true)}
            className="w-8 h-6 flex items-center justify-center hover:bg-[#e81123] text-[#a0a0a0] hover:text-white transition-colors"
            title="Close"
          >
            <span className="text-[12px] leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TIER 2: Authentic Native Menu Bar (File, Edit, Clip, etc.)   */}
      {/* ============================================================ */}
      <div
        ref={menuBarRef}
        className="h-6 bg-[#222222] border-b border-[#2d2d2d] flex items-center px-1 text-[12px] relative"
      >
        {Object.keys(menuDefinitions).map((menuName) => {
          const isMenuOpen = activeMenu === menuName;
          return (
            <div key={menuName} className="relative">
              <button
                onClick={() => handleMenuClick(menuName)}
                onMouseEnter={() => activeMenu && handleMenuClick(menuName)}
                className={`px-2 py-0.5 text-[12px] font-normal transition-colors rounded-sm ${
                  isMenuOpen
                    ? 'bg-[#1473e6] text-white'
                    : 'text-[#e1e1e1] hover:bg-[#2d2d2d] hover:text-white'
                }`}
              >
                {menuName}
              </button>

              {/* Native Dropdown Window */}
              {isMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-0.5 w-64 py-1 bg-[#252525] border border-[#383838] shadow-2xl z-50 text-[12px] animate-in fade-in duration-75"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  {menuDefinitions[menuName].map((item, idx) => {
                    if (item.type === 'divider') {
                      return <div key={`div-${idx}`} className="h-[1px] bg-[#383838] my-1" />;
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
                              ? 'text-[#666666] cursor-default'
                              : isSubOpen
                              ? 'bg-[#1473e6] text-white'
                              : 'text-[#e1e1e1] hover:bg-[#1473e6] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {item.checked !== undefined ? (
                              <span
                                className={`text-[11px] font-bold w-3 text-center ${
                                  item.checked ? 'text-white' : 'text-transparent'
                                }`}
                              >
                                ✓
                              </span>
                            ) : null}
                            <span className="truncate">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.shortcut && (
                              <span className="text-3xs text-[#8e8e8e] font-mono tracking-wider">
                                {item.shortcut}
                              </span>
                            )}
                            {hasSub && (
                              <span className="text-3xs text-[#8e8e8e] font-mono leading-none">
                                ›
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Flyout Submenu */}
                        {hasSub && isSubOpen && item.submenu && (
                          <div className="absolute left-full top-0 ml-0.5 w-56 py-1 bg-[#252525] border border-[#383838] shadow-2xl z-50 text-[12px] animate-in fade-in duration-75">
                            {item.submenu.map((sub, sIdx) => {
                              if (sub.type === 'divider') {
                                return (
                                  <div key={`sdiv-${sIdx}`} className="h-[1px] bg-[#383838] my-1" />
                                );
                              }
                              return (
                                <button
                                  key={`sitem-${sIdx}`}
                                  onClick={() => {
                                    if (sub.action) sub.action();
                                    closeAllMenus();
                                  }}
                                  className="w-full px-3 py-1 flex items-center justify-between text-left text-[#e1e1e1] hover:bg-[#1473e6] hover:text-white transition-colors"
                                >
                                  <span className="truncate">{sub.label}</span>
                                  {sub.shortcut && (
                                    <span className="text-3xs text-[#8e8e8e] font-mono tracking-wider">
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

      {/* ============================================================ */}
      {/* TIER 3: Premiere Pro Workspace Header Bar (Home, Import/Edit) */}
      {/* ============================================================ */}
      <div className="h-10 bg-[#222222] border-b border-[#303030] px-3 flex items-center justify-between">
        {/* Left: Home Icon, Import, Edit (Selected with Blue Line), Export */}
        <div className="flex items-center gap-1 h-full">
          {/* Home Button */}
          <button
            onClick={() => setWelcomeOpen(true)}
            className="w-8 h-8 rounded hover:bg-[#2d2d2d] flex items-center justify-center text-[#b0b0b0] hover:text-white transition-colors mr-1"
            title="Home Screen"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
          </button>

          {/* Import Tab */}
          <button
            onClick={() => showToastBanner('Import Workspace')}
            className="px-3 h-full flex items-center text-[12px] font-medium text-[#999999] hover:text-white hover:bg-[#282828] transition-colors"
          >
            Import
          </button>

          {/* Edit Tab (Active with Blue Underline) */}
          <button
            onClick={() => setActiveWorkspace('editing')}
            className="px-3 h-full flex items-center text-[12px] font-semibold text-white border-b-[2px] border-[#1473e6] bg-[#282828]"
          >
            Edit
          </button>

          {/* Export Tab */}
          <button
            onClick={openRenderProgressModal}
            className="px-3 h-full flex items-center text-[12px] font-medium text-[#999999] hover:text-white hover:bg-[#282828] transition-colors"
          >
            Export
          </button>
        </div>

        {/* Center: Sequence / Project Title */}
        <div className="text-[12px] font-medium text-[#888888] tracking-wide select-none">
          {projectName.replace('.prproj', '').replace('.cfs', '')} - Edited
        </div>

        {/* Right: Workspace Selector, Quick Export, Icons, Adobe Firefly AI, Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Workspace Pill Dropdown */}
          <div className="relative" ref={workspaceDropdownRef}>
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#2d2d2d] text-[11px] font-semibold text-[#c0c0c0] hover:text-white tracking-wider"
              title="Workspace Mode"
            >
              <span>LEARNING</span>
              <span className="text-[10px]">🗖</span>
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#252525] border border-[#383838] shadow-2xl py-1 rounded z-50 text-[11px]">
                {['LEARNING', 'EDITING', 'COLOR', 'AUDIO', 'GRAPHICS'].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace('editing');
                      setIsWorkspaceMenuOpen(false);
                      showToastBanner(`Switched to ${ws} workspace`);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#e1e1e1] hover:bg-[#1473e6] hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{ws}</span>
                    {ws === 'LEARNING' && <span className="text-white">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Export Button */}
          <button
            onClick={openRenderProgressModal}
            className="w-7 h-7 rounded hover:bg-[#2d2d2d] flex items-center justify-center text-[#b0b0b0] hover:text-white transition-colors"
            title="Quick Export (Ctrl+M)"
          >
            <span className="material-symbols-outlined text-[16px]">ios_share</span>
          </button>

          {/* Window / Layout toggle icon */}
          <button
            onClick={() => showToastBanner('Window Layout Management')}
            className="w-7 h-7 rounded hover:bg-[#2d2d2d] flex items-center justify-center text-[#b0b0b0] hover:text-white transition-colors"
            title="Layouts"
          >
            <span className="text-[12px] font-mono leading-none">☰</span>
          </button>

          {/* Search icon */}
          <button
            onClick={() => showToastBanner('Search Premiere Tools')}
            className="w-7 h-7 rounded hover:bg-[#2d2d2d] flex items-center justify-center text-[#b0b0b0] hover:text-white transition-colors"
            title="Search"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
          </button>

          {/* Sound / Volume icon */}
          <button
            onClick={() => showToastBanner('Audio Output Active')}
            className="w-7 h-7 rounded hover:bg-[#2d2d2d] flex items-center justify-center text-[#b0b0b0] hover:text-white transition-colors"
            title="Audio Volume"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
          </button>

          {/* Authentic Adobe Firefly Generative AI Button */}
          <button
            onClick={openVoiceModal}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff3366] via-[#9933ff] to-[#00ccff] p-[1.5px] hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="Adobe Firefly & AI Copilot Suite"
          >
            <div className="w-full h-full rounded-full bg-[#222222] flex items-center justify-center hover:bg-transparent transition-colors">
              <span className="material-symbols-outlined text-[13px] text-white">auto_awesome</span>
            </div>
          </button>

          {/* User Profile Avatar (dhairya gulati) */}
          <div
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-500 flex items-center justify-center text-white text-[9px] font-bold shadow-sm cursor-pointer ml-0.5"
            title="Dhairya Gulati"
          >
            DG
          </div>
        </div>
      </div>
    </div>
  );
};
