import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  WorkspaceLayout,
  ThemeMode,
  EditingTool,
  Track,
  Clip,
  ClipTransform,
  ClipColorAdjust,
  ClipEffect,
  SilenceCut,
  SilenceRemovalState,
  TranscriptItem,
  LumetriColorState,
  MediaAsset,
  ExportConfig,
  BatchRenderJob,
  TransitionItem,
  EffectItem,
  ProjectManifest,
} from '../types';

interface HistorySnapshot {
  clips: Clip[];
  tracks: Track[];
  currentTime: number;
}

interface TimelineState {
  // Project & Workspace
  projectName: string;
  projectDirectory: string;
  frameRate: number;
  resolution: string;
  colorSpace: string;
  activeWorkspace: WorkspaceLayout;
  themeMode: ThemeMode;
  recentProjects: ProjectManifest[];

  // Tools & Navigation
  activeTool: EditingTool;
  currentTime: number; // in seconds
  duration: number; // in seconds
  isPlaying: boolean;
  isLooping: boolean;
  toggleLooping: () => void;
  playbackRate: number; // 1 = 1x, -1 = reverse, 2 = 2x
  inPoint: number | null;
  outPoint: number | null;
  timelineZoom: number; // pixels per second
  isSafeMarginsActive: boolean;
  audioPeakL: number; // dB
  audioPeakR: number; // dB

  // Tracks & Clips
  tracks: Track[];
  clips: Clip[];
  selectedClipId: string | null;
  sourceAssetId: string | null;
  setSourceAssetId: (id: string | null) => void;

  // AI Silence Removal Pipeline
  silenceState: SilenceRemovalState;

  // Interactive Transcript
  transcript: TranscriptItem[];
  filterFillerWords: boolean;

  // Lumetri Color
  colorState: LumetriColorState;

  // Effects & Transitions
  transitions: TransitionItem[];
  activeTransition: TransitionItem;
  effects: EffectItem[];

  // Media Library
  mediaAssets: MediaAsset[];
  searchQuery: string;

  // Export & Batch Queue
  exportConfig: ExportConfig;
  batchJobs: BatchRenderJob[];

  // Modals & Panels
  isWelcomeOpen: boolean;
  isNewProjectOpen: boolean;
  isBatchQueueOpen: boolean;
  isVoiceModalOpen: boolean;
  isRenderProgressOpen: boolean;
  isKeyboardHelpOpen: boolean;
  isMediaBinOpen: boolean;
  isInspectorOpen: boolean;
  snappingEnabled: boolean;
  toastMessage: string | null;

  // Undo / Redo
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  setProjectName: (name: string) => void;
  setActiveWorkspace: (ws: WorkspaceLayout) => void;
  setActiveTab: (tab: string) => void;
  setThemeMode: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveTool: (tool: EditingTool) => void;

  setCurrentTime: (time: number) => void;
  stepFrame: (frames: number) => void;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
  setInPoint: (time?: number) => void;
  setOutPoint: (time?: number) => void;
  clearInOut: () => void;
  setTimelineZoom: (zoom: number) => void;
  toggleSafeMargins: () => void;

  // Track & Clip Operations
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  toggleLock: (trackId: string) => void;
  toggleSyncLock: (trackId: string) => void;
  setTrackVolume: (trackId: string, volumeDb: number) => void;
  selectClip: (clipId: string | null) => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  splitClipAtPlayhead: () => void;
  splitClipAt: (clipId: string, splitTime: number) => void;
  updateClipDuration: (clipId: string, newDuration: number, newStartTime?: number) => void;
  updateClipTransform: (clipId: string, transform: Partial<ClipTransform>) => void;
  updateClipColorAdjust: (clipId: string, color: Partial<ClipColorAdjust>) => void;
  deleteSelectedClip: () => void;
  insertAssetAtTrackAndTime: (assetId: string, trackId: string, time: number) => void;
  addTitleClip: (titleText?: string) => void;
  addEffectToClip: (clipId: string, effectType: ClipEffect['type']) => void;
  toggleClipEffect: (clipId: string, effectId: string) => void;
  updateClipEffectValue: (clipId: string, effectId: string, value: number) => void;
  removeClipEffect: (clipId: string, effectId: string) => void;

  // Silence Removal Actions
  setSilenceThreshold: (db: number) => void;
  setMinPauseSec: (sec: number) => void;
  startSilenceAnalysis: () => void;
  toggleSilencePreview: () => void;
  applySilenceCuts: () => void;
  discardSilenceCuts: () => void;

  // Transcript Actions
  jumpToWord: (startTime: number) => void;
  editTranscriptWord: (itemId: string, wordId: string, newText: string) => void;
  toggleFilterFillerWords: () => void;
  exportSubtitles: (format: 'srt' | 'vtt') => void;

  // Lumetri Actions
  updateColorParam: <K extends keyof LumetriColorState>(key: K, val: LumetriColorState[K]) => void;
  resetColorGrading: () => void;
  applyLutPreset: (lut: string) => void;

  // Effects Actions
  toggleEffect: (effectId: string) => void;
  setTransitionAlignment: (align: 'center' | 'start' | 'end') => void;
  setTransitionDuration: (sec: number) => void;

  // Export Actions
  updateExportConfig: <K extends keyof ExportConfig>(key: K, val: ExportConfig[K]) => void;
  startDirectRender: () => void;
  addToBatchQueue: () => void;
  toggleBatchJobStatus: (id: string) => void;
  removeBatchJob: (id: string) => void;

  // Modals & Panels
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  openRenderProgressModal: () => void;
  closeRenderProgressModal: () => void;
  setWelcomeOpen: (open: boolean) => void;
  setNewProjectOpen: (open: boolean) => void;
  setBatchQueueOpen: (open: boolean) => void;
  setKeyboardHelpOpen: (open: boolean) => void;
  toggleKeyboardHelp: () => void;
  toggleMediaBin: () => void;
  toggleInspector: () => void;
  toggleSnapping: () => void;
  showToastBanner: (msg: string) => void;

  // AI Quick Actions
  quickAutoCutSilence: () => void;
  quickAutoSubtitles: () => void;
  quickAutoColorMatch: () => void;
  quickVoiceIsolation: () => void;
  quickSocialReframe: () => void;
  insertAssetAtPlayhead: (assetId: string) => void;
  addMediaAsset: (asset: MediaAsset) => void;
  removeMediaAsset: (assetId: string) => void;
  clearMediaAssets: () => void;
  createNewProject: (manifest: Partial<ProjectManifest>) => void;
  resetToNewProject: () => void;
  loadDemoProject: () => void;
  importSampleAssets: () => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  pushHistorySnapshot: () => void;
}

const INITIAL_TRACKS: Track[] = [
  { id: 'v3', name: 'V3 B-Roll Overlay', type: 'video', index: 3, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: 0, color: '#0d99ff' },
  { id: 'v2', name: 'V2 Gfx & Lower Thirds', type: 'video', index: 2, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: 0, color: '#a855f7' },
  { id: 'v1', name: 'V1 A-Cam 4K ProRes', type: 'video', index: 1, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: 0, color: '#00e5ff' },
  { id: 'cc1', name: 'CC1 Word Diarization', type: 'subtitle', index: 0, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: 0, color: '#eab308' },
  { id: 'a1', name: 'A1 Dialogue Host (Elena)', type: 'audio', index: -1, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -2, color: '#10b981' },
  { id: 'a2', name: 'A2 Dialogue Co-Host (Marcus)', type: 'audio', index: -2, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -2, color: '#14b8a6' },
  { id: 'a3', name: 'A3 Foley & Hits (Samir)', type: 'audio', index: -3, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -6, color: '#f59e0b' },
  { id: 'a4', name: 'A4 Whoosh & Riser FX', type: 'audio', index: -4, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -8, color: '#f97316' },
  { id: 'a5', name: 'A5 Room Ambience 5.1', type: 'audio', index: -5, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -14, color: '#84cc16' },
  { id: 'a6', name: 'A6 Sound Design Bed', type: 'audio', index: -6, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -12, color: '#06b6d4' },
  { id: 'a7', name: 'A7 SFX Cinematic Glitch', type: 'audio', index: -7, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -10, color: '#ec4899' },
  { id: 'a8', name: 'A8 Master Score Bed', type: 'audio', index: -8, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -12, color: '#8b5cf6' },
  { id: 'a9', name: 'A9 Synthwave Outro Cue', type: 'audio', index: -9, isMuted: false, isSolo: false, isLocked: false, isSyncLocked: true, volumeDb: -10, color: '#6366f1' },
];

const INITIAL_CLIPS: Clip[] = [
  // Video Clips
  {
    id: 'c-v1-01',
    trackId: 'v1',
    title: 'A-CAM_Take04_Intro_4K.mov',
    startTime: 0,
    duration: 38,
    trimStart: 0,
    trimEnd: 38,
    color: '#00e5ff',
    speed: 1,
    volumeDb: 0,
    type: 'video',
    hasAiAnalysis: true,
  },
  {
    id: 'c-v1-02',
    trackId: 'v1',
    title: 'A-CAM_Take05_Discussion.mov',
    startTime: 40,
    duration: 44,
    trimStart: 0,
    trimEnd: 44,
    color: '#00e5ff',
    speed: 1,
    volumeDb: 0,
    type: 'video',
    hasAiAnalysis: true,
  },
  {
    id: 'c-v1-03',
    trackId: 'v1',
    title: 'A-CAM_Take06_Outro.mov',
    startTime: 86,
    duration: 34,
    trimStart: 0,
    trimEnd: 34,
    color: '#00e5ff',
    speed: 1,
    volumeDb: 0,
    type: 'video',
    hasAiAnalysis: true,
  },
  {
    id: 'c-v2-01',
    trackId: 'v2',
    title: 'Title_Card_Hero_Motion.mogr',
    startTime: 4,
    duration: 6,
    trimStart: 0,
    trimEnd: 6,
    color: '#a855f7',
    speed: 1,
    volumeDb: 0,
    type: 'video',
  },
  {
    id: 'c-v2-02',
    trackId: 'v2',
    title: 'LowerThird_Elena_Vasco.mogr',
    startTime: 14,
    duration: 5,
    trimStart: 0,
    trimEnd: 5,
    color: '#a855f7',
    speed: 1,
    volumeDb: 0,
    type: 'video',
  },
  {
    id: 'c-v3-01',
    trackId: 'v3',
    title: 'Drone_City_Hyperlapse_ACES.mov',
    startTime: 20,
    duration: 12,
    trimStart: 0,
    trimEnd: 12,
    color: '#0d99ff',
    speed: 1,
    volumeDb: 0,
    type: 'video',
    hasAiAnalysis: true,
  },
  {
    id: 'c-v3-02',
    trackId: 'v3',
    title: 'Macro_Studio_Rig_Insert.mov',
    startTime: 58,
    duration: 16,
    trimStart: 0,
    trimEnd: 16,
    color: '#0d99ff',
    speed: 1,
    volumeDb: 0,
    type: 'video',
  },

  // Audio Clips
  {
    id: 'c-a1-01',
    trackId: 'a1',
    title: 'Elena_Lav_48k24b_Take04.wav',
    startTime: 0,
    duration: 38,
    trimStart: 0,
    trimEnd: 38,
    color: '#10b981',
    speed: 1,
    volumeDb: -1.5,
    type: 'audio',
    speaker: 'Elena',
  },
  {
    id: 'c-a1-02',
    trackId: 'a1',
    title: 'Elena_Lav_48k24b_Take05.wav',
    startTime: 40,
    duration: 44,
    trimStart: 0,
    trimEnd: 44,
    color: '#10b981',
    speed: 1,
    volumeDb: -1.5,
    type: 'audio',
    speaker: 'Elena',
  },
  {
    id: 'c-a2-01',
    trackId: 'a2',
    title: 'Marcus_SM7B_Podcast_Host.wav',
    startTime: 16,
    duration: 22,
    trimStart: 0,
    trimEnd: 22,
    color: '#14b8a6',
    speed: 1,
    volumeDb: -2.0,
    type: 'audio',
    speaker: 'Marcus',
  },
  {
    id: 'c-a2-02',
    trackId: 'a2',
    title: 'Marcus_SM7B_Podcast_Host_02.wav',
    startTime: 62,
    duration: 22,
    trimStart: 0,
    trimEnd: 22,
    color: '#14b8a6',
    speed: 1,
    volumeDb: -2.0,
    type: 'audio',
    speaker: 'Marcus',
  },
  {
    id: 'c-a3-01',
    trackId: 'a3',
    title: 'Foley_ChairCreak_PencilTap.wav',
    startTime: 3,
    duration: 4,
    trimStart: 0,
    trimEnd: 4,
    color: '#f59e0b',
    speed: 1,
    volumeDb: -8,
    type: 'audio',
  },
  {
    id: 'c-a4-01',
    trackId: 'a4',
    title: 'Sub_Bass_Drop_Cinema_Hit.wav',
    startTime: 19.8,
    duration: 3.5,
    trimStart: 0,
    trimEnd: 3.5,
    color: '#f97316',
    speed: 1,
    volumeDb: -6,
    type: 'audio',
  },
  {
    id: 'c-a8-01',
    trackId: 'a8',
    title: 'Cinematic_Acoustic_Stems_Bed.wav',
    startTime: 0,
    duration: 72,
    trimStart: 0,
    trimEnd: 72,
    color: '#8b5cf6',
    speed: 1,
    volumeDb: -14,
    type: 'audio',
  },
  {
    id: 'c-a9-01',
    trackId: 'a9',
    title: 'Synthwave_Cyber_Master_Loop.wav',
    startTime: 72,
    duration: 48,
    trimStart: 0,
    trimEnd: 48,
    color: '#6366f1',
    speed: 1,
    volumeDb: -11,
    type: 'audio',
  },

  // Subtitle / CC Clips
  {
    id: 'c-cc1-01',
    trackId: 'cc1',
    title: 'CC1: Elena Intro Sync',
    startTime: 1.5,
    duration: 14,
    trimStart: 0,
    trimEnd: 14,
    color: '#eab308',
    speed: 1,
    volumeDb: 0,
    type: 'subtitle',
  },
  {
    id: 'c-cc1-02',
    trackId: 'cc1',
    title: 'CC1: Marcus Retort Sync',
    startTime: 16.5,
    duration: 18,
    trimStart: 0,
    trimEnd: 18,
    color: '#eab308',
    speed: 1,
    volumeDb: 0,
    type: 'subtitle',
  },
];

const INITIAL_TRANSCRIPT: TranscriptItem[] = [
  {
    id: 't-01',
    speaker: 'Elena',
    startTime: 1.2,
    endTime: 8.5,
    text: 'Welcome back to ClipFlow Studio. Today we are examining our new sub-16 millisecond timeline engine with zero dropped frames.',
    words: [
      { id: 'w-1', word: 'Welcome', start: 1.2, end: 1.6 },
      { id: 'w-2', word: 'back', start: 1.6, end: 1.9 },
      { id: 'w-3', word: 'to', start: 1.9, end: 2.1 },
      { id: 'w-4', word: 'ClipFlow', start: 2.1, end: 2.7 },
      { id: 'w-5', word: 'Studio.', start: 2.7, end: 3.3 },
      { id: 'w-6', word: 'Today', start: 3.8, end: 4.2 },
      { id: 'w-7', word: 'we', start: 4.2, end: 4.4 },
      { id: 'w-8', word: 'are', start: 4.4, end: 4.6 },
      { id: 'w-9', word: 'examining', start: 4.6, end: 5.2 },
      { id: 'w-10', word: 'our', start: 5.2, end: 5.4 },
      { id: 'w-11', word: 'new', start: 5.4, end: 5.7 },
      { id: 'w-12', word: 'sub-16', start: 5.7, end: 6.3 },
      { id: 'w-13', word: 'millisecond', start: 6.3, end: 7.0 },
      { id: 'w-14', word: 'timeline', start: 7.0, end: 7.5 },
      { id: 'w-15', word: 'engine', start: 7.5, end: 7.9 },
      { id: 'w-16', word: 'with', start: 7.9, end: 8.1 },
      { id: 'w-17', word: 'zero', start: 8.1, end: 8.3 },
      { id: 'w-18', word: 'dropped', start: 8.3, end: 8.4 },
      { id: 'w-19', word: 'frames.', start: 8.4, end: 8.5 },
    ],
  },
  {
    id: 't-02',
    speaker: 'Marcus',
    startTime: 16.2,
    endTime: 24.8,
    text: 'And what blew my mind, um, was the automatic silence detection. You literally click one button and all dead air vanishes.',
    words: [
      { id: 'w-20', word: 'And', start: 16.2, end: 16.4 },
      { id: 'w-21', word: 'what', start: 16.4, end: 16.7 },
      { id: 'w-22', word: 'blew', start: 16.7, end: 17.0 },
      { id: 'w-23', word: 'my', start: 17.0, end: 17.2 },
      { id: 'w-24', word: 'mind,', start: 17.2, end: 17.7 },
      { id: 'w-25', word: 'um,', start: 18.0, end: 18.6, isFiller: true },
      { id: 'w-26', word: 'was', start: 19.1, end: 19.4 },
      { id: 'w-27', word: 'the', start: 19.4, end: 19.6 },
      { id: 'w-28', word: 'automatic', start: 19.6, end: 20.3 },
      { id: 'w-29', word: 'silence', start: 20.3, end: 20.8 },
      { id: 'w-30', word: 'detection.', start: 20.8, end: 21.6 },
      { id: 'w-31', word: 'You', start: 22.0, end: 22.2 },
      { id: 'w-32', word: 'literally', start: 22.2, end: 22.8 },
      { id: 'w-33', word: 'click', start: 22.8, end: 23.2 },
      { id: 'w-34', word: 'one', start: 23.2, end: 23.5 },
      { id: 'w-35', word: 'button', start: 23.5, end: 23.9 },
      { id: 'w-36', word: 'and', start: 23.9, end: 24.1 },
      { id: 'w-37', word: 'all', start: 24.1, end: 24.3 },
      { id: 'w-38', word: 'dead', start: 24.3, end: 24.5 },
      { id: 'w-39', word: 'air', start: 24.5, end: 24.7 },
      { id: 'w-40', word: 'vanishes.', start: 24.7, end: 24.8 },
    ],
  },
  {
    id: 't-03',
    speaker: 'Samir',
    startTime: 26.0,
    endTime: 36.5,
    text: 'Notice how the ripple edit preserves the stereo phase lock on our 5.1 dialogue bus without causing clicks or audio pops.',
    words: [
      { id: 'w-41', word: 'Notice', start: 26.0, end: 26.5 },
      { id: 'w-42', word: 'how', start: 26.5, end: 26.8 },
      { id: 'w-43', word: 'the', start: 26.8, end: 27.0 },
      { id: 'w-44', word: 'ripple', start: 27.0, end: 27.4 },
      { id: 'w-45', word: 'edit', start: 27.4, end: 27.8 },
      { id: 'w-46', word: 'preserves', start: 27.8, end: 28.5 },
      { id: 'w-47', word: 'the', start: 28.5, end: 28.7 },
      { id: 'w-48', word: 'stereo', start: 28.7, end: 29.2 },
      { id: 'w-49', word: 'phase', start: 29.2, end: 29.6 },
      { id: 'w-50', word: 'lock', start: 29.6, end: 30.0 },
      { id: 'w-51', word: 'on', start: 30.0, end: 30.2 },
      { id: 'w-52', word: 'our', start: 30.2, end: 30.4 },
      { id: 'w-53', word: '5.1', start: 30.4, end: 31.0 },
      { id: 'w-54', word: 'dialogue', start: 31.0, end: 31.6 },
      { id: 'w-55', word: 'bus', start: 31.6, end: 32.1 },
      { id: 'w-56', word: 'without', start: 32.5, end: 33.0 },
      { id: 'w-57', word: 'causing', start: 33.0, end: 33.6 },
      { id: 'w-58', word: 'clicks', start: 33.6, end: 34.2 },
      { id: 'w-59', word: 'or', start: 34.2, end: 34.4 },
      { id: 'w-60', word: 'audio', start: 34.4, end: 35.0 },
      { id: 'w-61', word: 'pops.', start: 35.0, end: 36.5 },
    ],
  },
];

const INITIAL_SILENCE_CUTS: SilenceCut[] = [
  { id: 'sc-1', startTime: 8.5, endTime: 11.2, duration: 2.7, reason: 'dead_air', status: 'detected' },
  { id: 'sc-2', startTime: 18.0, endTime: 18.8, duration: 0.8, reason: 'filler_word', status: 'detected' },
  { id: 'sc-3', startTime: 38.0, endTime: 40.0, duration: 2.0, reason: 'dead_air', status: 'detected' },
  { id: 'sc-4', startTime: 53.4, endTime: 54.8, duration: 1.4, reason: 'breath_pause', status: 'detected' },
  { id: 'sc-5', startTime: 84.0, endTime: 86.0, duration: 2.0, reason: 'dead_air', status: 'detected' },
];

const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'm-1',
    name: 'A-CAM_Take04_Intro_4K.mov',
    type: 'video',
    duration: 38.0,
    resolution: '3840×2160',
    fps: 60,
    codec: 'Apple ProRes 422 HQ',
    channels: 'Stereo 48kHz 24b',
    proxyStatus: 'ready',
    aiBadges: ['Transcript Synced', 'Speech Diarized'],
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-2',
    name: 'A-CAM_Take05_Discussion.mov',
    type: 'video',
    duration: 44.0,
    resolution: '3840×2160',
    fps: 60,
    codec: 'Apple ProRes 422 HQ',
    channels: 'Stereo 48kHz 24b',
    proxyStatus: 'ready',
    aiBadges: ['Face Tracked', 'Auto Color Ref'],
    url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-3',
    name: 'Drone_City_Hyperlapse_ACES.mov',
    type: 'video',
    duration: 12.0,
    resolution: '4096×2160 DCI',
    fps: 24,
    codec: 'Apple ProRes 4444 XQ',
    channels: 'Mute',
    proxyStatus: 'ready',
    aiBadges: ['ACEScg Conformed'],
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-4',
    name: 'Macro_Studio_Rig_Insert.mov',
    type: 'video',
    duration: 16.0,
    resolution: '3840×2160',
    fps: 60,
    codec: 'Apple ProRes 422 HQ',
    channels: 'Mute',
    proxyStatus: 'generating',
    aiBadges: ['Depth Map Extracted'],
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-5',
    name: 'Elena_Lav_48k24b_Take04.wav',
    type: 'audio',
    duration: 38.0,
    resolution: 'Audio Master',
    fps: 0,
    codec: 'Broadcast WAV 24b',
    channels: 'Mono 48kHz',
    proxyStatus: 'ready',
    aiBadges: ['Voice Isolated', 'De-Essed'],
    url: '',
    thumbnail: '',
  },
  {
    id: 'm-6',
    name: 'Synthwave_Cyber_Master_Loop.wav',
    type: 'audio',
    duration: 48.0,
    resolution: 'Audio Master',
    fps: 0,
    codec: 'Broadcast WAV 24b',
    channels: 'Stereo 48kHz',
    proxyStatus: 'ready',
    aiBadges: ['Beat Gridded (128 BPM)'],
    url: '',
    thumbnail: '',
  },
];

const INITIAL_BATCH_JOBS: BatchRenderJob[] = [
  {
    id: 'job-1',
    name: 'Cyberpunk_Teaser_Master_v2.mov',
    preset: 'ProRes 422 HQ Broadcast Master',
    resolution: '3840×2160',
    format: 'MOV / ProRes 422 HQ',
    progress: 100,
    status: 'completed',
    fps: 58.4,
    eta: 'Completed (00:03:12)',
    outputPath: '/Volumes/Scratch_RAID0/Exports/Cyberpunk_Teaser_Master_v2.mov',
    fileSizeMb: 4820,
  },
  {
    id: 'job-2',
    name: 'ShortForm_Reels_Cutdown_Ep04.mp4',
    preset: 'Social Reels 9:16 Vertical',
    resolution: '1080×1920',
    format: 'MP4 / H.265 CRF 18',
    progress: 68,
    status: 'rendering',
    fps: 114.2,
    eta: '00:00:42 remaining',
    outputPath: '/Volumes/Scratch_RAID0/Exports/ShortForm_Reels_Cutdown_Ep04.mp4',
    fileSizeMb: 245,
  },
  {
    id: 'job-3',
    name: 'YouTube_4K_HDR_Deliverable.mp4',
    preset: 'YouTube 4K UHD Master',
    resolution: '3840×2160',
    format: 'MP4 / H.264 85 Mbps',
    progress: 0,
    status: 'queued',
    fps: 0,
    eta: 'In Queue',
    outputPath: '/Volumes/Scratch_RAID0/Exports/YouTube_4K_HDR_Deliverable.mp4',
    fileSizeMb: 1850,
  },
];

const INITIAL_RECENT_PROJECTS: ProjectManifest[] = [
  {
    id: 'p-1',
    name: 'Cyberpunk_Narrative_Commercial_4K',
    directory: 'D:/Projects/ClipFlow/Commercial_2026',
    resolution: '4K UHD (3840×2160)',
    fps: 60,
    colorSpace: 'ACEScg / Rec.709-A',
    template: 'Standard Commercial Project',
    updatedAt: '2026-11-09T22:30:00Z',
    sizeGb: 48.6,
  },
  {
    id: 'p-2',
    name: 'HighCadence_Podcast_Ep42_Marcus',
    directory: 'D:/Projects/ClipFlow/Podcast_Weekly',
    resolution: '9:16 Social (1080×1920)',
    fps: 30,
    colorSpace: 'Rec.709 Display',
    template: 'Social Media Template Project (9:16)',
    updatedAt: '2026-11-08T18:15:00Z',
    sizeGb: 14.2,
  },
  {
    id: 'p-3',
    name: 'Feature_Documentary_RoughAssembly',
    directory: 'D:/Projects/ClipFlow/Doc_Archive',
    resolution: '4K UHD (3840×2160)',
    fps: 24,
    colorSpace: 'ACEScc Film Print',
    template: 'Broadcast Template Project',
    updatedAt: '2026-11-05T14:40:00Z',
    sizeGb: 198.4,
  },
];

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
  // Project Info
  projectName: 'Untitled.prproj',
  projectDirectory: 'C:/Users/DHAIRYA GULATI/Documents/Adobe/Premiere Pro/26.0/Untitled',
  frameRate: 60,
  resolution: '4K UHD (3840×2160)',
  colorSpace: 'ACEScg / Rec.709-A',
  activeWorkspace: 'editing',
  themeMode: 'dark',
  recentProjects: INITIAL_RECENT_PROJECTS,

  // Navigation & Tools
  activeTool: 'selection',
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isLooping: false,
  toggleLooping: () => {
    set((state) => ({ isLooping: !state.isLooping }));
    get().showToastBanner(get().isLooping ? 'Loop Playback Enabled' : 'Loop Playback Disabled');
  },
  playbackRate: 1,
  inPoint: null,
  outPoint: null,
  timelineZoom: 45, // pixels per second
  isSafeMarginsActive: false,
  audioPeakL: -60,
  audioPeakR: -60,

  // Tracks & Clips (Fresh empty project - no clips preloaded)
  tracks: INITIAL_TRACKS,
  clips: [],
  selectedClipId: null,
  sourceAssetId: null,
  setSourceAssetId: (id: string | null) => set({ sourceAssetId: id }),

  // Silence Removal Pipeline
  silenceState: {
    thresholdDb: -28,
    minPauseSec: 0.45,
    stage: 1,
    isAnalyzing: false,
    isPreviewActive: false,
    cuts: [],
    undoToken: null,
  },

  // Interactive Transcript
  transcript: [],
  filterFillerWords: false,

  // Lumetri Color
  colorState: {
    liftRgb: [0, -2, 4],
    gammaRgb: [-1, 2, -1],
    gainRgb: [2, 1, -3],
    exposure: 0.25,
    contrast: 14,
    highlights: -12,
    shadows: 8,
    temperature: 5800,
    vibrance: 18,
    activeLut: 'Film Look: Teal & Orange 35mm',
    isSplitCompare: false,
  },

  // Effects & Transitions
  transitions: [
    { id: 'tr-1', name: 'Cross Dissolve (Standard)', durationSec: 0.75, alignment: 'center', reverse: false, type: 'cross_dissolve' },
    { id: 'tr-2', name: 'Dip to Black', durationSec: 0.5, alignment: 'end', reverse: false, type: 'dip_to_black' },
    { id: 'tr-3', name: 'Morph Cut (AI Dialogue Blend)', durationSec: 0.35, alignment: 'center', reverse: false, type: 'morph_cut' },
    { id: 'tr-4', name: 'Zoom Blur Impact', durationSec: 0.4, alignment: 'start', reverse: false, type: 'zoom_blur' },
  ],
  activeTransition: {
    id: 'tr-1',
    name: 'Cross Dissolve (Standard)',
    durationSec: 0.75,
    alignment: 'center',
    reverse: false,
    type: 'cross_dissolve',
  },
  effects: [
    { id: 'fx-1', name: 'Neural Voice Isolation', category: 'audio', applied: true, paramName: 'Suppression dB', paramValue: -18 },
    { id: 'fx-2', name: 'Parametric Dialogue EQ', category: 'audio', applied: true, paramName: 'Low Cut', paramValue: 80 },
    { id: 'fx-3', name: 'Multiband Dynamics Compressor', category: 'audio', applied: false },
    { id: 'fx-4', name: 'Optical Flow Motion Estimation', category: 'video', applied: true, paramName: 'Smoothness', paramValue: 85 },
    { id: 'fx-5', name: 'Chromatic Aberration Flare', category: 'video', applied: false },
    { id: 'fx-6', name: 'Gaussian Defocus Vignette', category: 'video', applied: false },
  ],

  // Media Library (Fresh empty project - user imports media)
  mediaAssets: [],
  searchQuery: '',

  // Export & Batch
  exportConfig: {
    preset: 'ProRes 422 HQ Broadcast Master',
    container: 'mov',
    videoCodec: 'ProRes 422 HQ',
    audioCodec: 'Linear PCM 24-bit',
    resolution: '4K UHD (3840x2160)',
    fps: 60,
    crf: 14,
    targetBitrateMbps: 120,
    hwAccel: 'Metal M2 Max',
    isBatchQueueOpen: false,
  },
  batchJobs: INITIAL_BATCH_JOBS,

  // Modals & Panels
  isWelcomeOpen: false,
  isNewProjectOpen: false,
  isBatchQueueOpen: false,
  isVoiceModalOpen: false,
  isRenderProgressOpen: false,
  isKeyboardHelpOpen: false,
  isMediaBinOpen: true,
  isInspectorOpen: true,
  snappingEnabled: true,
  toastMessage: null,

  // Undo / Redo
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  // Actions
  setProjectName: (name: string) => set({ projectName: name }),

  setActiveWorkspace: (ws: WorkspaceLayout) => set({ activeWorkspace: ws }),

  setActiveTab: (tab: string) => {
    if (tab === 'render' || tab === 'export') {
      set({ activeWorkspace: 'editing', isBatchQueueOpen: true });
    } else if (tab === 'editing' || tab === 'color' || tab === 'audio' || tab === 'graphics') {
      set({ activeWorkspace: tab as WorkspaceLayout });
    }
  },

  setThemeMode: (theme: ThemeMode) => {
    set({ themeMode: theme });
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }
  },

  toggleTheme: () => {
    const next = get().themeMode === 'dark' ? 'light' : 'dark';
    get().setThemeMode(next);
  },

  setActiveTool: (tool: EditingTool) => set({ activeTool: tool }),

  setCurrentTime: (time: number) => {
    const clips = get().clips;
    const sequenceEnd =
      clips.length > 0 ? Math.max(...clips.map((c) => c.startTime + c.duration)) : get().duration;
    const maxDur = sequenceEnd > 0 ? sequenceEnd : Math.max(30, get().duration);
    const clamped = Math.max(0, Math.min(maxDur, time));
    // Simulate dynamic audio peak fluctuations based on playback
    const isOverAudio = get().clips.some(
      (c) => c.type === 'audio' && clamped >= c.startTime && clamped <= c.startTime + c.duration
    );
    const audioPeakL = isOverAudio ? -14 + (Math.random() * 8 - 4) : -60;
    const audioPeakR = isOverAudio ? -15 + (Math.random() * 8 - 4) : -60;

    set({ currentTime: clamped, audioPeakL, audioPeakR });
  },

  stepFrame: (frames: number) => {
    const { currentTime, frameRate } = get();
    get().setCurrentTime(currentTime + frames * (1 / frameRate));
  },

  togglePlayPause: () => {
    const { currentTime, clips, isPlaying, duration } = get();
    const sequenceEnd =
      clips.length > 0 ? Math.max(...clips.map((c) => c.startTime + c.duration)) : duration;

    if (!isPlaying) {
      if (sequenceEnd <= 0) return;
      // If playhead is at the exact end of footage, restart from 0
      const newTime = currentTime >= sequenceEnd - 0.02 ? 0 : currentTime;
      set({ isPlaying: true, playbackRate: 1, currentTime: newTime });
    } else {
      set({ isPlaying: false });
    }
  },

  setPlaybackRate: (rate: number) => {
    set({ playbackRate: rate, isPlaying: rate !== 0 });
  },

  setInPoint: (time?: number) => {
    const t = time !== undefined ? time : get().currentTime;
    set({ inPoint: t });
    get().showToastBanner(`In Point marked at ${t.toFixed(2)}s`);
  },

  setOutPoint: (time?: number) => {
    const t = time !== undefined ? time : get().currentTime;
    set({ outPoint: t });
    get().showToastBanner(`Out Point marked at ${t.toFixed(2)}s`);
  },

  clearInOut: () => {
    set({ inPoint: null, outPoint: null });
    get().showToastBanner('In/Out Points Cleared');
  },

  setTimelineZoom: (zoom: number) => {
    const clamped = Math.max(15, Math.min(180, zoom));
    set({ timelineZoom: clamped });
  },

  toggleSafeMargins: () => {
    set((state) => ({ isSafeMarginsActive: !state.isSafeMarginsActive }));
  },

  // Track & Clip Operations
  toggleMute: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t)),
    }));
  },

  toggleSolo: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isSolo: !t.isSolo } : t)),
    }));
  },

  toggleLock: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isLocked: !t.isLocked } : t)),
    }));
  },

  toggleSyncLock: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isSyncLocked: !t.isSyncLocked } : t)),
    }));
  },

  setTrackVolume: (trackId: string, volumeDb: number) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, volumeDb } : t)),
    }));
  },

  selectClip: (clipId: string | null) => {
    set({ selectedClipId: clipId });
  },

  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => {
    get().pushHistorySnapshot();
    const updatedClips = get().clips.map((c) =>
      c.id === clipId
        ? {
            ...c,
            startTime: Math.max(0, newStartTime),
            trackId: newTrackId ?? c.trackId,
          }
        : c
    );
    const seqEnd =
      updatedClips.length > 0
        ? Math.max(...updatedClips.map((c) => c.startTime + c.duration))
        : 0;
    set({ clips: updatedClips, duration: seqEnd });
  },

  splitClipAtPlayhead: () => {
    const { currentTime, clips, selectedClipId } = get();
    const targetClip = clips.find(
      (c) =>
        (selectedClipId ? c.id === selectedClipId : true) &&
        currentTime > c.startTime &&
        currentTime < c.startTime + c.duration
    );

    if (!targetClip) {
      get().showToastBanner('No clip intersect at playhead to razor cut');
      return;
    }

    get().pushHistorySnapshot();

    const firstDuration = currentTime - targetClip.startTime;
    const secondDuration = targetClip.duration - firstDuration;

    const firstHalf: Clip = {
      ...targetClip,
      duration: firstDuration,
      trimEnd: targetClip.trimStart + firstDuration,
    };

    const secondHalf: Clip = {
      ...targetClip,
      id: `${targetClip.id}_cut_${Date.now()}`,
      startTime: currentTime,
      duration: secondDuration,
      trimStart: targetClip.trimStart + firstDuration,
    };

    set((state) => ({
      clips: state.clips.map((c) => (c.id === targetClip.id ? firstHalf : c)).concat(secondHalf),
      selectedClipId: secondHalf.id,
    }));

    get().showToastBanner(`Split clip at ${currentTime.toFixed(2)}s`);
  },

  deleteSelectedClip: () => {
    const { selectedClipId, clips } = get();
    if (!selectedClipId) return;

    get().pushHistorySnapshot();
    const remainingClips = clips.filter((c) => c.id !== selectedClipId);
    const seqEnd =
      remainingClips.length > 0
        ? Math.max(...remainingClips.map((c) => c.startTime + c.duration))
        : 0;
    set({
      clips: remainingClips,
      selectedClipId: null,
      duration: seqEnd,
      currentTime: Math.min(get().currentTime, seqEnd),
      isPlaying: remainingClips.length === 0 ? false : get().isPlaying,
    });
    get().showToastBanner('Deleted selected clip');
  },

  splitClipAt: (clipId: string, splitTime: number) => {
    const { clips } = get();
    const targetClip = clips.find((c) => c.id === clipId);
    if (!targetClip) return;
    if (splitTime <= targetClip.startTime + 0.05 || splitTime >= targetClip.startTime + targetClip.duration - 0.05) return;

    get().pushHistorySnapshot();
    const firstDuration = splitTime - targetClip.startTime;
    const secondDuration = targetClip.duration - firstDuration;

    const firstHalf: Clip = {
      ...targetClip,
      duration: firstDuration,
      trimEnd: targetClip.trimStart + firstDuration,
    };

    const secondHalf: Clip = {
      ...targetClip,
      id: `${targetClip.id}_cut_${Date.now()}`,
      startTime: splitTime,
      duration: secondDuration,
      trimStart: targetClip.trimStart + firstDuration,
    };

    set((state) => ({
      clips: state.clips.map((c) => (c.id === targetClip.id ? firstHalf : c)).concat(secondHalf),
      selectedClipId: secondHalf.id,
    }));
    get().showToastBanner(`Razor Cut clip at ${splitTime.toFixed(2)}s`);
  },

  updateClipDuration: (clipId: string, newDuration: number, newStartTime?: number) => {
    get().pushHistorySnapshot();
    const updatedClips = get().clips.map((c) => {
      if (c.id !== clipId) return c;
      const sTime = newStartTime !== undefined ? Math.max(0, newStartTime) : c.startTime;
      const dur = Math.max(0.2, newDuration);
      return {
        ...c,
        startTime: sTime,
        duration: dur,
        trimEnd: c.trimStart + dur,
      };
    });
    const seqEnd =
      updatedClips.length > 0
        ? Math.max(...updatedClips.map((c) => c.startTime + c.duration))
        : 0;
    set({ clips: updatedClips, duration: seqEnd });
  },

  updateClipTransform: (clipId: string, transform: Partial<ClipTransform>) => {
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId
          ? {
              ...c,
              transform: {
                positionX: 0,
                positionY: 0,
                scale: 100,
                rotation: 0,
                opacity: 100,
                ...c.transform,
                ...transform,
              },
            }
          : c
      ),
    }));
  },

  updateClipColorAdjust: (clipId: string, color: Partial<ClipColorAdjust>) => {
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId
          ? {
              ...c,
              colorAdjust: {
                exposure: 0,
                contrast: 0,
                saturation: 100,
                temperature: 0,
                ...c.colorAdjust,
                ...color,
              },
            }
          : c
      ),
    }));
  },

  insertAssetAtTrackAndTime: (assetId: string, trackId: string, time: number) => {
    const { mediaAssets, clips } = get();
    const asset = mediaAssets.find((a) => a.id === assetId);
    if (!asset) return;

    get().pushHistorySnapshot();
    const isVisual =
      asset.type === 'video' ||
      asset.type === 'image' ||
      /\.(mp4|mov|webm|mkv|avi|jpg|jpeg|png|webp|gif|svg)$/i.test(asset.name);
    const clipDuration = asset.duration && asset.duration > 0 ? asset.duration : (isVisual ? 5 : 10);
    const startT = Math.max(0, time);

    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      trackId: trackId || (isVisual ? 'v1' : 'a1'),
      title: asset.name,
      startTime: startT,
      duration: clipDuration,
      trimStart: 0,
      trimEnd: clipDuration,
      color: isVisual ? '#00e5ff' : '#10b981',
      speed: 1,
      volumeDb: 0,
      type: isVisual ? 'video' : 'audio',
      mediaUrl: asset.url || asset.thumbnail,
      hasAiAnalysis: true,
      transform: { positionX: 0, positionY: 0, scale: 100, rotation: 0, opacity: 100 },
      colorAdjust: { exposure: 0, contrast: 0, saturation: 100, temperature: 0 },
    };

    const updatedClips = [...clips, newClip];
    const sequenceEnd = Math.max(...updatedClips.map((c) => c.startTime + c.duration));
    set({
      clips: updatedClips,
      selectedClipId: newClip.id,
      sourceAssetId: asset.id,
      duration: sequenceEnd,
    });
    get().showToastBanner(`Placed "${asset.name}" on ${newClip.trackId.toUpperCase()} at ${startT.toFixed(1)}s`);
  },

  addTitleClip: (titleText = 'Title Card') => {
    get().pushHistorySnapshot();
    const { currentTime, clips } = get();
    const titleClip: Clip = {
      id: `title-${Date.now()}`,
      trackId: 'v2',
      title: titleText,
      startTime: currentTime,
      duration: 5,
      trimStart: 0,
      trimEnd: 5,
      color: '#ec4899',
      speed: 1,
      volumeDb: 0,
      type: 'video',
      transform: { positionX: 0, positionY: 0, scale: 100, rotation: 0, opacity: 100 },
      colorAdjust: { exposure: 0, contrast: 0, saturation: 100, temperature: 0 },
    };
    const updatedClips = [...clips, titleClip];
    const sequenceEnd = Math.max(...updatedClips.map((c) => c.startTime + c.duration));
    set({
      clips: updatedClips,
      selectedClipId: titleClip.id,
      duration: sequenceEnd,
    });
    get().showToastBanner(`Added Title "${titleText}" on V2`);
  },

  addEffectToClip: (clipId: string, effectType: ClipEffect['type']) => {
    get().pushHistorySnapshot();
    const EFFECT_INFO: Record<
      ClipEffect['type'],
      { name: string; category: ClipEffect['category']; defaultValue: number }
    > = {
      gaussian_blur: { name: 'Gaussian Blur', category: 'video', defaultValue: 35 },
      black_and_white: { name: 'Black & White (Monochrome)', category: 'color', defaultValue: 100 },
      sepia_vintage: { name: 'Sepia Vintage 35mm', category: 'color', defaultValue: 80 },
      invert: { name: 'Invert Colors', category: 'stylize', defaultValue: 100 },
      cinematic_glow: { name: 'Cinematic Radiant Glow', category: 'stylize', defaultValue: 50 },
      vignette: { name: 'Cinematic Vignette', category: 'stylize', defaultValue: 60 },
      warm_sunset: { name: 'Warm Sunset Gold', category: 'color', defaultValue: 70 },
      cool_cyan: { name: 'Cool Matrix Cyan', category: 'color', defaultValue: 75 },
      high_contrast_noir: { name: 'High Contrast Film Noir', category: 'color', defaultValue: 65 },
    };

    const info = EFFECT_INFO[effectType];
    const newEffect: ClipEffect = {
      id: `fx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: info.name,
      type: effectType,
      category: info.category,
      enabled: true,
      value: info.defaultValue,
    };

    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId
          ? {
              ...c,
              effects: [...(c.effects || []), newEffect],
            }
          : c
      ),
    }));
    get().showToastBanner(`Applied effect "${info.name}"`);
  },

  toggleClipEffect: (clipId: string, effectId: string) => {
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId
          ? {
              ...c,
              effects: (c.effects || []).map((fx) =>
                fx.id === effectId ? { ...fx, enabled: !fx.enabled } : fx
              ),
            }
          : c
      ),
    }));
  },

  updateClipEffectValue: (clipId: string, effectId: string, value: number) => {
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId
          ? {
              ...c,
              effects: (c.effects || []).map((fx) =>
                fx.id === effectId ? { ...fx, value: Math.max(0, Math.min(100, value)) } : fx
              ),
            }
          : c
      ),
    }));
  },

  removeClipEffect: (clipId: string, effectId: string) => {
    get().pushHistorySnapshot();
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId
          ? {
              ...c,
              effects: (c.effects || []).filter((fx) => fx.id !== effectId),
            }
          : c
      ),
    }));
    get().showToastBanner('Removed effect');
  },

  // Silence Removal Actions
  setSilenceThreshold: (db: number) => {
    set((state) => ({ silenceState: { ...state.silenceState, thresholdDb: db } }));
  },

  setMinPauseSec: (sec: number) => {
    set((state) => ({ silenceState: { ...state.silenceState, minPauseSec: sec } }));
  },

  startSilenceAnalysis: () => {
    set((state) => ({
      silenceState: {
        ...state.silenceState,
        isAnalyzing: true,
        stage: 1,
      },
    }));

    get().showToastBanner('AI Stage 1: Local Spectral Denoising (WebGPU Core)...');

    setTimeout(() => {
      set((state) => ({ silenceState: { ...state.silenceState, stage: 2 } }));
      get().showToastBanner('AI Stage 2: Voice Activity & Silence Gap Detection...');
    }, 600);

    setTimeout(() => {
      set((state) => ({ silenceState: { ...state.silenceState, stage: 3 } }));
      get().showToastBanner('AI Stage 3: Frame-Accurate Cut Marker Generation...');
    }, 1200);

    setTimeout(() => {
      set((state) => ({
        silenceState: {
          ...state.silenceState,
          stage: 4,
          isAnalyzing: false,
          isPreviewActive: true,
          cuts: INITIAL_SILENCE_CUTS,
          undoToken: `TOKEN_APPLY_${Date.now()}`,
        },
      }));
      get().showToastBanner('AI Stage 4: 5 Silence gaps detected (8.9s total dead air)');
    }, 1800);
  },

  toggleSilencePreview: () => {
    set((state) => ({
      silenceState: {
        ...state.silenceState,
        isPreviewActive: !state.silenceState.isPreviewActive,
      },
    }));
  },

  applySilenceCuts: () => {
    const { clips, silenceState } = get();
    get().pushHistorySnapshot();

    // Perform ripple edit cut logic on clips:
    // Mark cuts as applied and shrink/shift clips
    const sortedCuts = [...silenceState.cuts].sort((a, b) => b.startTime - a.startTime);
    let updatedClips = [...clips];

    sortedCuts.forEach((cut) => {
      updatedClips = updatedClips
        .map((clip) => {
          if (clip.startTime >= cut.endTime) {
            // Ripple shift left
            return {
              ...clip,
              startTime: Math.max(0, clip.startTime - cut.duration),
            };
          } else if (clip.startTime < cut.startTime && clip.startTime + clip.duration > cut.endTime) {
            // Clip spans over cut
            return {
              ...clip,
              duration: clip.duration - cut.duration,
            };
          }
          return clip;
        })
        .filter((clip) => clip.duration > 0.1);
    });

    const appliedCuts = silenceState.cuts.map((c) => ({ ...c, status: 'applied' as const }));

    set((state) => ({
      clips: updatedClips,
      silenceState: {
        ...state.silenceState,
        cuts: appliedCuts,
        isPreviewActive: false,
      },
    }));

    get().showToastBanner(`Applied ripple edit: 8.9s dead air cut across all sync tracks`);
  },

  discardSilenceCuts: () => {
    set((state) => ({
      silenceState: {
        ...state.silenceState,
        isPreviewActive: false,
        cuts: state.silenceState.cuts.map((c) => ({ ...c, status: 'discarded' as const })),
      },
    }));
    get().showToastBanner('Discarded silence cut suggestions');
  },

  // Transcript Actions
  jumpToWord: (startTime: number) => {
    get().setCurrentTime(startTime);
    get().showToastBanner(`Playhead jumped to ${startTime.toFixed(2)}s`);
  },

  editTranscriptWord: (itemId: string, wordId: string, newText: string) => {
    get().pushHistorySnapshot();
    set((state) => ({
      transcript: state.transcript.map((item) =>
        item.id === itemId
          ? {
              ...item,
              words: item.words.map((w) => (w.id === wordId ? { ...w, word: newText } : w)),
              text: item.words.map((w) => (w.id === wordId ? newText : w.word)).join(' '),
            }
          : item
      ),
    }));
  },

  toggleFilterFillerWords: () => {
    set((state) => ({ filterFillerWords: !state.filterFillerWords }));
  },

  exportSubtitles: (format: 'srt' | 'vtt') => {
    const { transcript } = get();
    let fileContent = '';

    if (format === 'vtt') {
      fileContent = 'WEBVTT\n\n';
      transcript.forEach((item, idx) => {
        const start = new Date(item.startTime * 1000).toISOString().substr(11, 12);
        const end = new Date(item.endTime * 1000).toISOString().substr(11, 12);
        fileContent += `${idx + 1}\n${start} --> ${end}\n<v ${item.speaker}>${item.text}\n\n`;
      });
    } else {
      transcript.forEach((item, idx) => {
        const start = new Date(item.startTime * 1000).toISOString().substr(11, 12).replace('.', ',');
        const end = new Date(item.endTime * 1000).toISOString().substr(11, 12).replace('.', ',');
        fileContent += `${idx + 1}\n${start} --> ${end}\n[${item.speaker}] ${item.text}\n\n`;
      });
    }

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Subtitles_${get().projectName.replace('.cfs', '')}.${format}`;
    link.click();
    URL.revokeObjectURL(url);

    get().showToastBanner(`Exported .${format} subtitles with speaker diarization`);
  },

  // Lumetri Actions
  updateColorParam: (key, val) => {
    set((state) => ({
      colorState: {
        ...state.colorState,
        [key]: val,
      },
    }));
  },

  resetColorGrading: () => {
    set({
      colorState: {
        liftRgb: [0, 0, 0],
        gammaRgb: [0, 0, 0],
        gainRgb: [0, 0, 0],
        exposure: 0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
        temperature: 5600,
        vibrance: 0,
        activeLut: 'None',
        isSplitCompare: false,
      },
    });
    get().showToastBanner('Reset Lumetri color grading parameters to neutral');
  },

  applyLutPreset: (lut: string) => {
    set((state) => ({
      colorState: {
        ...state.colorState,
        activeLut: lut,
      },
    }));
    get().showToastBanner(`Applied LUT preset: ${lut}`);
  },

  // Effects Actions
  toggleEffect: (effectId: string) => {
    set((state) => ({
      effects: state.effects.map((fx) => (fx.id === effectId ? { ...fx, applied: !fx.applied } : fx)),
    }));
  },

  setTransitionAlignment: (align: 'center' | 'start' | 'end') => {
    set((state) => ({
      activeTransition: { ...state.activeTransition, alignment: align },
    }));
  },

  setTransitionDuration: (sec: number) => {
    set((state) => ({
      activeTransition: { ...state.activeTransition, durationSec: sec },
    }));
  },

  // Export Actions
  updateExportConfig: (key, val) => {
    set((state) => ({
      exportConfig: {
        ...state.exportConfig,
        [key]: val,
      },
    }));
  },

  startDirectRender: () => {
    get().openRenderProgressModal();
  },

  addToBatchQueue: () => {
    const { exportConfig, projectName } = get();
    const newJob: BatchRenderJob = {
      id: `job-${Date.now()}`,
      name: `${projectName.replace('.cfs', '')}_${exportConfig.preset.replace(/\s+/g, '_')}.${exportConfig.container}`,
      preset: exportConfig.preset,
      resolution: exportConfig.resolution,
      format: `${exportConfig.container.toUpperCase()} / ${exportConfig.videoCodec}`,
      progress: 0,
      status: 'queued',
      fps: 0,
      eta: 'In Queue',
      outputPath: `/Volumes/Scratch_RAID0/Exports/${projectName.replace('.cfs', '')}.${exportConfig.container}`,
      fileSizeMb: Math.round(exportConfig.targetBitrateMbps * 15),
    };

    set((state) => ({
      batchJobs: [newJob, ...state.batchJobs],
      isBatchQueueOpen: true,
    }));
    get().showToastBanner(`Added job to render queue: ${newJob.name}`);
  },

  toggleBatchJobStatus: (id: string) => {
    set((state) => ({
      batchJobs: state.batchJobs.map((j) =>
        j.id === id ? { ...j, status: j.status === 'rendering' ? 'paused' : 'rendering' } : j
      ),
    }));
  },

  removeBatchJob: (id: string) => {
    set((state) => ({
      batchJobs: state.batchJobs.filter((j) => j.id !== id),
    }));
  },

  // Modals & Panels
  openVoiceModal: () => set({ isVoiceModalOpen: true }),
  closeVoiceModal: () => set({ isVoiceModalOpen: false }),
  openRenderProgressModal: () => set({ isRenderProgressOpen: true }),
  closeRenderProgressModal: () => set({ isRenderProgressOpen: false }),
  setWelcomeOpen: (open: boolean) => set({ isWelcomeOpen: open }),
  setNewProjectOpen: (open: boolean) => set({ isNewProjectOpen: open }),
  setBatchQueueOpen: (open: boolean) => set({ isBatchQueueOpen: open }),
  setKeyboardHelpOpen: (open: boolean) => set({ isKeyboardHelpOpen: open }),
  toggleKeyboardHelp: () => set((state) => ({ isKeyboardHelpOpen: !state.isKeyboardHelpOpen })),
  toggleMediaBin: () => set((state) => ({ isMediaBinOpen: !state.isMediaBinOpen })),
  toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
  toggleSnapping: () => {
    const next = !get().snappingEnabled;
    set({ snappingEnabled: next });
    get().showToastBanner(`Timeline Snapping ${next ? 'Enabled' : 'Disabled'} (S)`);
  },

  // AI Quick Actions (User-Friendly Superpowers)
  quickAutoCutSilence: () => {
    get().showToastBanner('⚡ Auto-Cut: Scanning 4K audio tracks for dead air & filler words...');
    get().startSilenceAnalysis();
  },

  quickAutoSubtitles: () => {
    get().showToastBanner('💬 Auto-Captions: Synchronizing diarized speech to CC1 subtitle track...');
    // Ensure subtitle clip exists on CC1
    const { clips, currentTime } = get();
    const hasCC = clips.some((c) => c.trackId === 'cc1' && currentTime >= c.startTime && currentTime <= c.startTime + c.duration);
    if (!hasCC) {
      const newCC: Clip = {
        id: `c-cc-gen-${Date.now()}`,
        trackId: 'cc1',
        title: 'CC1: Auto Speech-to-Text Diarization',
        startTime: currentTime,
        duration: 15,
        trimStart: 0,
        trimEnd: 15,
        color: '#eab308',
        speed: 1,
        volumeDb: 0,
        type: 'subtitle',
      };
      set({ clips: [...clips, newCC] });
    }
    get().showToastBanner('Generated word-accurate subtitles with speaker badges on CC1');
  },

  quickAutoColorMatch: () => {
    get().pushHistorySnapshot();
    set((state) => ({
      colorState: {
        ...state.colorState,
        exposure: 0.35,
        contrast: 18,
        highlights: -8,
        shadows: 12,
        temperature: 5700,
        vibrance: 22,
        activeLut: 'Film Look: Teal & Orange 35mm',
      },
    }));
    get().showToastBanner('🎨 Auto-Color: Skin tones balanced & 35mm Film LUT matched');
  },

  quickVoiceIsolation: () => {
    get().pushHistorySnapshot();
    set((state) => ({
      effects: state.effects.map((fx) =>
        fx.id === 'fx-1' ? { ...fx, applied: true, paramValue: -22 } : fx
      ),
    }));
    get().showToastBanner('🎙 Voice Isolation: Background rumble suppressed (-22 dB)');
  },

  quickSocialReframe: () => {
    const isVertical = get().resolution.includes('9:16');
    const newRes = isVertical ? '4K UHD (3840×2160)' : '9:16 Social (1080×1920)';
    set({ resolution: newRes });
    get().showToastBanner(`📱 Social Reframe: Workspace conformed to ${newRes}`);
  },

  insertAssetAtPlayhead: (assetId: string) => {
    const { mediaAssets, currentTime, clips } = get();
    const asset = mediaAssets.find((a) => a.id === assetId);
    if (!asset) return;

    get().pushHistorySnapshot();
    const isVisual =
      asset.type === 'video' ||
      asset.type === 'image' ||
      /\.(mp4|mov|webm|mkv|avi|jpg|jpeg|png|webp|gif|svg)$/i.test(asset.name);
    const targetTrackId = isVisual ? 'v1' : 'a1';
    const clipDuration = asset.duration && asset.duration > 0 ? asset.duration : (isVisual ? 5 : 10);
    const startT = clips.length === 0 ? 0 : currentTime;

    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      trackId: targetTrackId,
      title: asset.name,
      startTime: startT,
      duration: Math.min(25, clipDuration),
      trimStart: 0,
      trimEnd: Math.min(25, clipDuration),
      color: isVisual ? '#00e5ff' : '#10b981',
      speed: 1,
      volumeDb: 0,
      type: isVisual ? 'video' : 'audio',
      mediaUrl: asset.url || asset.thumbnail,
      hasAiAnalysis: true,
    };

    // Sanitize any existing visual clips that were saved on audio track
    const sanitizedClips = clips.map((c) => {
      const cIsVisual = /\.(mp4|mov|webm|mkv|avi|jpg|jpeg|png|webp|gif|svg)$/i.test(c.title);
      if (cIsVisual && (c.trackId.startsWith('a') || c.type === 'audio')) {
        return {
          ...c,
          trackId: 'v1',
          type: 'video' as const,
          mediaUrl: c.mediaUrl || asset.url,
        };
      }
      return c;
    });

    const updatedClips = [...sanitizedClips, newClip];
    const sequenceEnd = Math.max(...updatedClips.map((c) => c.startTime + c.duration));

    set({
      clips: updatedClips,
      selectedClipId: newClip.id,
      sourceAssetId: asset.id,
      duration: sequenceEnd,
    });
    get().showToastBanner(`Inserted "${asset.name}" onto ${targetTrackId.toUpperCase()} at ${currentTime.toFixed(1)}s`);
  },

  addMediaAsset: (asset: MediaAsset) => {
    set((state) => ({
      mediaAssets: [asset, ...state.mediaAssets.filter((a) => a.id !== asset.id)],
    }));
  },

  removeMediaAsset: (assetId: string) => {
    set((state) => ({
      mediaAssets: state.mediaAssets.filter((a) => a.id !== assetId),
    }));
    get().showToastBanner('Removed asset from Project');
  },

  clearMediaAssets: () => {
    set({ mediaAssets: [] });
    get().showToastBanner('Cleared all assets from Project Bin');
  },

  importSampleAssets: () => {
    set({ mediaAssets: INITIAL_MEDIA_ASSETS });
    get().showToastBanner('Imported 6 production media assets into Project Bin');
  },

  resetToNewProject: () => {
    set({
      projectName: 'Untitled.prproj',
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      playbackRate: 1,
      inPoint: null,
      outPoint: null,
      clips: [],
      mediaAssets: [],
      selectedClipId: null,
      silenceState: {
        thresholdDb: -28,
        minPauseSec: 0.45,
        stage: 1,
        isAnalyzing: false,
        isPreviewActive: false,
        cuts: [],
        undoToken: null,
      },
      transcript: [],
      audioPeakL: -60,
      audioPeakR: -60,
    });
    get().showToastBanner('Clean slate: Started fresh project (Untitled.prproj)');
  },

  loadDemoProject: () => {
    set({
      projectName: 'Cyberpunk_Narrative_Commercial_4K.cfs',
      currentTime: 0,
      duration: 120,
      isPlaying: false,
      playbackRate: 1,
      inPoint: 12,
      outPoint: 74,
      clips: INITIAL_CLIPS,
      mediaAssets: INITIAL_MEDIA_ASSETS,
      transcript: INITIAL_TRANSCRIPT,
      selectedClipId: 'c-v1-01',
      silenceState: {
        thresholdDb: -28,
        minPauseSec: 0.45,
        stage: 4,
        isAnalyzing: false,
        isPreviewActive: true,
        cuts: INITIAL_SILENCE_CUTS,
        undoToken: 'TOKEN_SILENCE_PREVIEW_INIT',
      },
    });
    get().showToastBanner('Loaded Demo Sequence: Cyberpunk Narrative (10 Tracks)');
  },

  showToastBanner: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 3500);
  },

  createNewProject: (manifest: Partial<ProjectManifest>) => {
    const newName = manifest.name || 'Untitled.prproj';
    const newManifest: ProjectManifest = {
      id: `proj-${Date.now()}`,
      name: newName,
      directory: manifest.directory || 'C:/Users/DHAIRYA GULATI/Documents/Adobe/Premiere Pro/26.0/Untitled',
      resolution: manifest.resolution || '4K UHD (3840×2160)',
      fps: manifest.fps || 60,
      colorSpace: manifest.colorSpace || 'ACEScg / Rec.709-A',
      template: manifest.template || 'Standard Commercial Project',
      updatedAt: new Date().toISOString(),
      sizeGb: 0.1,
    };

    set((state) => ({
      projectName: newName,
      projectDirectory: newManifest.directory,
      resolution: newManifest.resolution,
      frameRate: newManifest.fps,
      colorSpace: newManifest.colorSpace,
      recentProjects: [newManifest, ...state.recentProjects],
      isNewProjectOpen: false,
      isWelcomeOpen: false,
      currentTime: 0,
      duration: 0,
      clips: [],
      mediaAssets: [],
      selectedClipId: null,
      inPoint: null,
      outPoint: null,
    }));

    get().showToastBanner(`Created New Project: ${newName}`);
  },

  // Undo / Redo
  pushHistorySnapshot: () => {
    const { clips, tracks, currentTime, undoStack } = get();
    const snapshot: HistorySnapshot = {
      clips: JSON.parse(JSON.stringify(clips)),
      tracks: JSON.parse(JSON.stringify(tracks)),
      currentTime,
    };
    set({
      undoStack: [snapshot, ...undoStack.slice(0, 30)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const { undoStack, redoStack, clips, tracks, currentTime } = get();
    if (undoStack.length === 0) return;

    const [prev, ...restUndo] = undoStack;
    const currentSnapshot: HistorySnapshot = {
      clips: JSON.parse(JSON.stringify(clips)),
      tracks: JSON.parse(JSON.stringify(tracks)),
      currentTime,
    };

    set({
      clips: prev.clips,
      tracks: prev.tracks,
      currentTime: prev.currentTime,
      undoStack: restUndo,
      redoStack: [currentSnapshot, ...redoStack],
      canUndo: restUndo.length > 0,
      canRedo: true,
    });

    get().showToastBanner('Undo performed (Snapshot Journal restored)');
  },

  redo: () => {
    const { undoStack, redoStack, clips, tracks, currentTime } = get();
    if (redoStack.length === 0) return;

    const [next, ...restRedo] = redoStack;
    const currentSnapshot: HistorySnapshot = {
      clips: JSON.parse(JSON.stringify(clips)),
      tracks: JSON.parse(JSON.stringify(tracks)),
      currentTime,
    };

    set({
      clips: next.clips,
      tracks: next.tracks,
      currentTime: next.currentTime,
      undoStack: [currentSnapshot, ...undoStack],
      redoStack: restRedo,
      canUndo: true,
      canRedo: restRedo.length > 0,
    });

    get().showToastBanner('Redo performed');
  },
    }),
    {
      name: 'clipflow_studio_project_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectName: state.projectName,
        projectDirectory: state.projectDirectory,
        frameRate: state.frameRate,
        resolution: state.resolution,
        colorSpace: state.colorSpace,
        activeWorkspace: state.activeWorkspace,
        themeMode: state.themeMode,
        tracks: state.tracks,
        clips: state.clips,
        mediaAssets: state.mediaAssets,
        colorState: state.colorState,
        recentProjects: state.recentProjects,
        snappingEnabled: state.snappingEnabled,
      }),
    }
  )
);

