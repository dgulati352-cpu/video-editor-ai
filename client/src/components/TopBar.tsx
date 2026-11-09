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
    timelineZoom,
    setTimelineZoom,
    snappingEnabled,
    toggleSnapping,
    toggleSafeMargins,
    isSafeMarginsActive,
    quickSocialReframe,
    quickAutoSubtitles,
    setCurrentTime,
    inPoint,
    outPoint,
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
      { label: 'Rename...', disabled: true },
      { label: 'Make Subclip...', shortcut: 'Ctrl+U', disabled: true },
      { label: 'Edit Subclip...', disabled: true },
      { label: 'Edit Offline...', disabled: true },
      { label: 'Source Settings...', disabled: true },
      { type: 'divider' },
      {
        label: 'Modify',
        hasSubmenu: true,
        submenu: [
          { label: 'Audio Channels...', action: () => showToastBanner('Configuring track audio channels (5.1 / Stereo)') },
          { label: 'Interpret Footage...', action: () => showToastBanner('Interpret Footage: 60.00 fps conformed') },
          { label: 'Timecode...', action: () => showToastBanner('Set starting timecode: 01:00:00:00') },
          { label: 'Captions...', action: () => showToastBanner('Caption track formatting conformed') },
        ],
      },
      {
        label: 'Video Options',
        hasSubmenu: true,
        submenu: [
          { label: 'Motion...', action: () => showToastBanner('Transform: Scale 100%, Position Center') },
          { label: 'Frame Hold...', action: () => showToastBanner('Held frame at playhead position') },
          { label: 'Field Options...', action: () => showToastBanner('Field Order: Progressive 60p') },
          { label: 'Time Remapping...', action: () => showToastBanner('Speed Ramp & Time Remapping enabled') },
        ],
      },
      {
        label: 'Audio Options',
        hasSubmenu: true,
        submenu: [
          { label: 'Audio Gain...', shortcut: 'G', action: () => showToastBanner('Audio Gain: 0.0 dB (Peak -6.0 dBFS)') },
          { label: 'Audio Pitch Shifter...', action: () => showToastBanner('Pitch Shift conformed (0 semitones)') },
          { label: 'Render Audio', action: () => showToastBanner('Rendered audio mix bus') },
        ],
      },
      { type: 'divider' },
      {
        label: 'Speed/Duration...',
        shortcut: 'Ctrl+R',
        action: () => showToastBanner('Speed: 100% (Optical Flow Frame Interpolation)'),
      },
      {
        label: 'Scene Edit Detection...',
        action: () => showToastBanner('Running AI Scene Edit Detection across cut points...'),
      },
      {
        label: 'Enable Enhance Speech',
        action: () => showToastBanner('Dialogue enhanced with neural voice isolation (-18 dB)'),
      },
      {
        label: 'Remix',
        hasSubmenu: true,
        submenu: [
          { label: 'Enable Remix', action: () => showToastBanner('AI Music Remix enabled: Target 120s') },
          { label: 'Remix Properties...', action: () => showToastBanner('Remix Segments: Dynamic 8-bar cuts') },
        ],
      },
      { type: 'divider' },
      { label: 'Insert', shortcut: ',', action: () => showToastBanner('Inserted clip into sequence at playhead') },
      { label: 'Overwrite', shortcut: '.', action: () => showToastBanner('Overwrote clip into sequence at playhead') },
      { type: 'divider' },
      { label: 'Replace Footage...', disabled: true },
      {
        label: 'Replace With Clip',
        hasSubmenu: true,
        disabled: true,
        submenu: [
          { label: 'From Bin' },
          { label: 'From Source Monitor' },
          { label: 'From Match Frame' },
        ],
      },
      { label: 'Render and Replace...', disabled: true },
      { label: 'Restore Unrendered', disabled: true },
      { label: 'Restore Captions from Source Clip', disabled: true },
      { label: 'Update Metadata...', disabled: true },
      { type: 'divider' },
      {
        label: 'Generate Audio Waveform',
        action: () => showToastBanner('Peak audio waveforms regenerated across tracks'),
      },
      {
        label: 'Auto-Tag Audio Types',
        action: () => showToastBanner('Auto-tagged stems: Dialogue (A1-A2), SFX (A3-A7), Score (A8-A9)'),
      },
      { type: 'divider' },
      { label: 'Automate to Sequence...', disabled: true },
      { type: 'divider' },
      {
        label: 'Enable',
        shortcut: 'Shift+E',
        disabled: !selectedClipId,
        action: () => showToastBanner('Clip visibility toggled'),
      },
      {
        label: 'Link',
        shortcut: 'Ctrl+L',
        disabled: !selectedClipId,
        action: () => showToastBanner('Linked video and audio channels'),
      },
      {
        label: 'Group',
        shortcut: 'Ctrl+G',
        disabled: !selectedClipId,
        action: () => showToastBanner('Grouped selected timeline clips'),
      },
      { label: 'Ungroup', shortcut: 'Ctrl+Shift+G', disabled: true },
      { label: 'Synchronize...', disabled: true },
      { label: 'Merge Clips...', disabled: true },
      {
        label: 'Nest...',
        disabled: !selectedClipId,
        action: () => showToastBanner('Nested selected clips into new sub-sequence'),
      },
      { label: 'Create Multi-Camera Source Sequence...', disabled: true },
      {
        label: 'Multi-Camera',
        hasSubmenu: true,
        disabled: true,
        submenu: [{ label: 'Enable' }, { label: 'Flatten' }],
      },
    ],

    Sequence: [
      {
        label: 'Sequence Settings...',
        action: () => showToastBanner('Sequence: 3840×2160 60.00fps ACEScg Rec.709-A'),
      },
      { type: 'divider' },
      {
        label: 'Render Effects in Work Area',
        shortcut: 'Enter',
        action: () => openRenderProgressModal(),
      },
      { label: 'Render Entire Work Area', action: () => openRenderProgressModal() },
      { label: 'Render Selection', action: () => openRenderProgressModal() },
      { label: 'Render Audio', action: () => showToastBanner('Rendered audio mix bus') },
      { label: 'Delete Render Files', action: () => showToastBanner('Deleted scratch preview files') },
      { label: 'Delete Work Area Render Files', action: () => showToastBanner('Deleted work area preview files') },
      { type: 'divider' },
      { label: 'Match Frame', shortcut: 'F', action: () => showToastBanner('Matched Source Monitor frame (F)') },
      { label: 'Reverse Match Frame', shortcut: 'Shift+R', action: () => showToastBanner('Reverse matched timeline frame') },
      { type: 'divider' },
      { label: 'Add Edit', shortcut: 'Ctrl+K', action: () => splitClipAtPlayhead() },
      { label: 'Add Edit to All Tracks', shortcut: 'Ctrl+Shift+K', action: () => splitClipAtPlayhead() },
      { label: 'Trim Edit', shortcut: 'Shift+T', action: () => showToastBanner('Trim edit mode activated') },
      { label: 'Extend Selected Edit to Playhead', shortcut: 'E', action: () => showToastBanner('Extended edit point to playhead') },
      { type: 'divider' },
      { label: 'Apply Video Transition', shortcut: 'Ctrl+D', action: () => showToastBanner('Applied Cross Dissolve') },
      { label: 'Apply Audio Transition', shortcut: 'Ctrl+Shift+D', action: () => showToastBanner('Applied Constant Power Crossfade') },
      { label: 'Apply Default Transitions to Selection', shortcut: 'Shift+D', action: () => showToastBanner('Applied default transitions to selection') },
      { type: 'divider' },
      { label: 'Lift', shortcut: ';', action: () => showToastBanner('Lifted range between In/Out points') },
      { label: 'Extract', shortcut: "'", action: () => showToastBanner('Extracted range & closed ripple gap') },
      { type: 'divider' },
      { label: 'Zoom In', shortcut: '=', action: () => setTimelineZoom(timelineZoom + 15) },
      { label: 'Zoom Out', shortcut: '-', action: () => setTimelineZoom(timelineZoom - 15) },
      { type: 'divider' },
      { label: 'Close Gap', action: () => showToastBanner('Closed track gap') },
      {
        label: 'Go to Gap',
        hasSubmenu: true,
        submenu: [
          { label: 'Next in Sequence', action: () => showToastBanner('Jumped to next track gap') },
          { label: 'Previous in Sequence', action: () => showToastBanner('Jumped to previous track gap') },
        ],
      },
      { type: 'divider' },
      { label: 'Snap in Timeline', shortcut: 'S', action: () => toggleSnapping() },
      { label: 'Linked Selection', action: () => showToastBanner('Linked selection toggled') },
      { label: 'Selection Follows Playhead', action: () => showToastBanner('Selection follows playhead enabled') },
      { label: 'Show Through Edits', action: () => showToastBanner('Showing through edits') },
      { type: 'divider' },
      { label: 'Normalize Mix Track...', action: () => showToastBanner('Master mix normalized to -14.0 LUFS') },
      { type: 'divider' },
      { label: 'Make Subsequence', shortcut: 'Shift+U', action: () => showToastBanner('Created subsequence from In/Out range') },
      { type: 'divider' },
      { label: 'Auto Reframe Sequence...', action: () => quickSocialReframe() },
      { label: 'Transcribe Sequence...', action: () => quickAutoSubtitles() },
      { label: 'Simplify Sequence...', action: () => showToastBanner('Simplified sequence tracks') },
      { type: 'divider' },
      { label: 'Add Tracks...', action: () => showToastBanner('Added Video V4 & Audio A10 tracks') },
      { label: 'Delete Tracks...', action: () => showToastBanner('Deleted empty tracks') },
      { type: 'divider' },
      {
        label: 'Captions',
        hasSubmenu: true,
        submenu: [
          { label: 'Create Captions from Transcript...', action: () => quickAutoSubtitles() },
          { label: 'Add New Caption Track...', action: () => showToastBanner('Added CC2 Secondary Subtitle track') },
          { label: 'Import Subtitle File (.srt/.vtt)...', action: () => showToastBanner('Imported subtitles file') },
        ],
      },
    ],

    Markers: [
      { label: 'Mark In', shortcut: 'I', action: () => setInPoint() },
      { label: 'Mark Out', shortcut: 'O', action: () => setOutPoint() },
      { label: 'Mark Clip', shortcut: 'X', action: () => showToastBanner('Marked In/Out to selected clip') },
      { label: 'Mark Selection', shortcut: '/', action: () => showToastBanner('Marked In/Out to selection') },
      {
        label: 'Mark Split',
        hasSubmenu: true,
        submenu: [
          { label: 'Mark In Split', action: () => showToastBanner('Marked In Split') },
          { label: 'Mark Out Split', action: () => showToastBanner('Marked Out Split') },
        ],
      },
      { type: 'divider' },
      {
        label: 'Go to In',
        shortcut: 'Shift+I',
        action: () => {
          if (inPoint !== null) setCurrentTime(inPoint);
          showToastBanner('Playhead jumped to In Point');
        },
      },
      {
        label: 'Go to Out',
        shortcut: 'Shift+O',
        action: () => {
          if (outPoint !== null) setCurrentTime(outPoint);
          showToastBanner('Playhead jumped to Out Point');
        },
      },
      {
        label: 'Go to Split',
        hasSubmenu: true,
        submenu: [
          { label: 'Go to In Split', action: () => showToastBanner('Jumped to In Split') },
          { label: 'Go to Out Split', action: () => showToastBanner('Jumped to Out Split') },
        ],
      },
      { type: 'divider' },
      { label: 'Clear In', shortcut: 'Ctrl+Shift+I', action: () => clearInOut() },
      { label: 'Clear Out', shortcut: 'Ctrl+Shift+O', action: () => clearInOut() },
      { label: 'Clear In and Out', shortcut: 'Ctrl+Shift+X', action: () => clearInOut() },
      { type: 'divider' },
      { label: 'Add Marker', shortcut: 'M', action: () => showToastBanner('Added Marker at current timecode') },
      { label: 'Add Range Marker', shortcut: 'Ctrl+Alt+Shift+N', action: () => showToastBanner('Added Range Marker') },
      { label: 'Add Range Marker to In and Out', shortcut: 'Alt+Shift+N', action: () => showToastBanner('Added Range Marker between In and Out') },
      { label: 'Go to Next Marker', shortcut: 'Shift+M', action: () => showToastBanner('Jumped to Next Marker') },
      { label: 'Go to Previous Marker', shortcut: 'Ctrl+Shift+M', action: () => showToastBanner('Jumped to Previous Marker') },
      { type: 'divider' },
      { label: 'Clear Selected Marker', shortcut: 'Ctrl+Alt+M', action: () => showToastBanner('Cleared Selected Marker') },
      { label: 'Clear Markers', shortcut: 'Ctrl+Alt+Shift+M', action: () => showToastBanner('Cleared all timeline markers') },
      { label: 'Show All Marker Colors', action: () => showToastBanner('Showing all marker color tags') },
      { type: 'divider' },
      { label: 'Edit Marker...', action: () => showToastBanner('Marker Name: Chapter 01 | Color: Cyan') },
      { type: 'divider' },
      { label: 'Add Chapter Marker...', action: () => showToastBanner('Added YouTube Chapter Marker') },
      { label: 'Add Flash Cue Marker...', action: () => showToastBanner('Added Flash Cue Marker') },
      { type: 'divider' },
      { label: 'Ripple Sequence Markers', action: () => showToastBanner('Sequence markers lock to ripple edit') },
      { label: 'Copy Paste Includes Sequence Markers', action: () => showToastBanner('Markers copied with clip blocks') },
    ],

    'Graphics and Titles': [
      { label: 'Add Fonts from Adobe Fonts...', action: () => showToastBanner('Opening Typography Catalog...') },
      { label: 'Install Motion Graphics Template...', action: () => showToastBanner('Installed .mogrt motion graphic template') },
      { type: 'divider' },
      {
        label: 'New Layer',
        hasSubmenu: true,
        submenu: [
          { label: 'Text', action: () => showToastBanner('Added Text Layer on V2') },
          { label: 'Vertical Text', action: () => showToastBanner('Added Vertical Text Layer') },
          { label: 'Rectangle', action: () => showToastBanner('Added Rectangle Shape') },
          { label: 'Ellipse', action: () => showToastBanner('Added Ellipse Shape') },
          { label: 'From File...', action: () => showToastBanner('Imported graphics file') },
        ],
      },
      { type: 'divider' },
      {
        label: 'Align to Video Frame',
        hasSubmenu: true,
        submenu: [
          { label: 'Horizontal Center', action: () => showToastBanner('Aligned to Horizontal Center') },
          { label: 'Vertical Center', action: () => showToastBanner('Aligned to Vertical Center') },
          { label: 'Left', action: () => showToastBanner('Aligned to Left Frame') },
          { label: 'Right', action: () => showToastBanner('Aligned to Right Frame') },
          { label: 'Top', action: () => showToastBanner('Aligned to Top Frame') },
          { label: 'Bottom', action: () => showToastBanner('Aligned to Bottom Frame') },
        ],
      },
      {
        label: 'Align to Video Frame as Group',
        hasSubmenu: true,
        submenu: [
          { label: 'Horizontal Center', action: () => showToastBanner('Group aligned to Horizontal Center') },
          { label: 'Vertical Center', action: () => showToastBanner('Group aligned to Vertical Center') },
        ],
      },
      {
        label: 'Align to Selection',
        hasSubmenu: true,
        submenu: [
          { label: 'Left Edges' },
          { label: 'Horizontal Centers' },
          { label: 'Right Edges' },
          { label: 'Top Edges' },
          { label: 'Vertical Centers' },
          { label: 'Bottom Edges' },
        ],
      },
      {
        label: 'Distribute',
        hasSubmenu: true,
        submenu: [
          { label: 'Horizontally', action: () => showToastBanner('Distributed graphics horizontally') },
          { label: 'Vertically', action: () => showToastBanner('Distributed graphics vertically') },
        ],
      },
      {
        label: 'Arrange',
        hasSubmenu: true,
        submenu: [
          { label: 'Bring to Front', action: () => showToastBanner('Brought graphic to front') },
          { label: 'Bring Forward', action: () => showToastBanner('Brought graphic forward') },
          { label: 'Send Backward', action: () => showToastBanner('Sent graphic backward') },
          { label: 'Send to Back', action: () => showToastBanner('Sent graphic to back') },
        ],
      },
      {
        label: 'Select',
        hasSubmenu: true,
        submenu: [
          { label: 'Next Layer Above' },
          { label: 'Next Layer Below' },
        ],
      },
      { type: 'divider' },
      { label: 'Upgrade to Source Graphic', action: () => showToastBanner('Upgraded graphic to master source') },
      { label: 'Upgrade Caption to Graphic', action: () => showToastBanner('Upgraded caption to motion graphic') },
      { label: 'Reset All Parameters', action: () => showToastBanner('Reset title parameters to default') },
      { label: 'Reset Duration', action: () => showToastBanner('Reset graphic duration to 5.0s') },
      { type: 'divider' },
      { label: 'Export As Motion Graphics Template...', action: () => showToastBanner('Exported .mogrt template') },
      { type: 'divider' },
      { label: 'Replace Fonts in Projects...', action: () => showToastBanner('Replace font dialog opened') },
    ],

    View: [
      {
        label: 'Playback Resolution',
        hasSubmenu: true,
        submenu: [
          { label: 'Full', action: () => showToastBanner('Playback Resolution: Full (3840×2160)') },
          { label: '1/2', action: () => showToastBanner('Playback Resolution: 1/2 (1920×1080)') },
          { label: '1/4', action: () => showToastBanner('Playback Resolution: 1/4 (960×540)') },
          { label: '1/8', action: () => showToastBanner('Playback Resolution: 1/8 (480×270)') },
          { label: '1/16', action: () => showToastBanner('Playback Resolution: 1/16 (240×135)') },
        ],
      },
      {
        label: 'Paused Resolution',
        hasSubmenu: true,
        submenu: [
          { label: 'Full', action: () => showToastBanner('Paused Resolution: Full (3840×2160)') },
          { label: '1/2', action: () => showToastBanner('Paused Resolution: 1/2') },
          { label: '1/4', action: () => showToastBanner('Paused Resolution: 1/4') },
        ],
      },
      { label: 'High Quality Playback', action: () => showToastBanner('High Quality 10-bit playback enabled') },
      { type: 'divider' },
      {
        label: 'Display Mode',
        hasSubmenu: true,
        submenu: [
          { label: 'Composite Video', action: () => showToastBanner('Display: Composite Video') },
          { label: 'Alpha', action: () => showToastBanner('Display: Alpha Channel') },
          { label: 'Multi-Camera', action: () => showToastBanner('Display: Multi-Camera 4-Up') },
          { label: 'Comparison View', action: () => showToastBanner('Display: Split Comparison View') },
        ],
      },
      {
        label: 'Magnification',
        hasSubmenu: true,
        submenu: [
          { label: 'Fit', action: () => showToastBanner('Magnification: Fit Window (42%)') },
          { label: '10%', action: () => showToastBanner('Magnification: 10%') },
          { label: '25%', action: () => showToastBanner('Magnification: 25%') },
          { label: '50%', action: () => showToastBanner('Magnification: 50%') },
          { label: '75%', action: () => showToastBanner('Magnification: 75%') },
          { label: '100%', action: () => showToastBanner('Magnification: 100% 1:1 Pixel') },
          { label: '150%', action: () => showToastBanner('Magnification: 150%') },
          { label: '200%', action: () => showToastBanner('Magnification: 200%') },
          { label: '400%', action: () => showToastBanner('Magnification: 400%') },
        ],
      },
      { type: 'divider' },
      { label: 'Show Rulers', shortcut: 'Ctrl+R', action: () => showToastBanner('Program Monitor pixel rulers toggled') },
      { label: 'Show Guides', shortcut: 'Ctrl+;', action: () => showToastBanner('Composition guides toggled') },
      { label: 'Lock Guides', action: () => showToastBanner('Guides locked in position') },
      { label: 'Add Guide...', action: () => showToastBanner('Add guide at coordinate') },
      { label: 'Clear Guides', action: () => showToastBanner('Guides cleared') },
      { type: 'divider' },
      { label: 'Snap in Program Monitor', action: () => showToastBanner('Program Monitor canvas snapping active') },
      { type: 'divider' },
      {
        label: 'Guide Templates',
        hasSubmenu: true,
        submenu: [
          { label: 'Action / Title Safe 90%/80%', action: () => toggleSafeMargins() },
          { label: 'Social 9:16 Guides', action: () => showToastBanner('Social 9:16 safe area overlay displayed') },
          { label: 'Cinemascope 2.39:1 Overlay', action: () => showToastBanner('2.39:1 letterbox guides displayed') },
          { label: 'Rule of Thirds 3×3 Grid', action: () => showToastBanner('Rule of thirds grid overlay displayed') },
        ],
      },
      { type: 'divider' },
      { label: 'Dynamic Audio Waveforms', action: () => showToastBanner('Dynamic audio waveforms enabled') },
      { label: 'Show Filmstrip Thumbnails', action: () => showToastBanner('Filmstrip thumbnails displayed on video tracks') },
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
