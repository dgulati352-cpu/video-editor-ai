export type WorkspaceLayout = 'editing' | 'color' | 'audio' | 'graphics';
export type ThemeMode = 'dark' | 'light';

export type EditingTool =
  | 'selection'        // V
  | 'track_forward'    // A
  | 'ripple_edit'      // B
  | 'rolling_edit'     // N
  | 'razor_cut'        // C
  | 'slip'             // Y
  | 'slide'            // U
  | 'pen'              // P
  | 'hand'             // H
  | 'zoom';            // Z

export type TrackType = 'video' | 'audio' | 'subtitle';

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  index: number;
  isMuted: boolean;
  isSolo: boolean;
  isLocked: boolean;
  isSyncLocked: boolean;
  volumeDb: number;
  color?: string;
}

export interface ClipTransform {
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface ClipColorAdjust {
  exposure: number;
  contrast: number;
  saturation: number;
  temperature: number;
}

export interface Clip {
  id: string;
  trackId: string;
  title: string;
  startTime: number;     // seconds on timeline
  duration: number;      // timeline duration
  trimStart: number;     // internal source trim start
  trimEnd: number;       // internal source trim end
  color: string;         // label color badge
  speed: number;         // 0.5x to 5.0x
  volumeDb: number;      // -60 to +12 dB
  type: 'video' | 'audio' | 'subtitle';
  mediaUrl?: string;
  hasAiAnalysis?: boolean;
  speaker?: string;
  transform?: ClipTransform;
  colorAdjust?: ClipColorAdjust;
}

export interface SilenceCut {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  reason: 'dead_air' | 'filler_word' | 'breath_pause';
  status: 'detected' | 'applied' | 'discarded';
}

export interface SilenceRemovalState {
  thresholdDb: number;       // -40 to -10 dB
  minPauseSec: number;       // 0.2s to 1.5s
  stage: 1 | 2 | 3 | 4;      // 1: Spectral Denoising, 2: Gap Detection, 3: Marker Gen, 4: Ripple Cut Preview
  isAnalyzing: boolean;
  isPreviewActive: boolean;
  cuts: SilenceCut[];
  undoToken: string | null;
}

export interface TranscriptWord {
  id: string;
  word: string;
  start: number;
  end: number;
  isFiller?: boolean;
}

export interface TranscriptItem {
  id: string;
  speaker: 'Elena' | 'Marcus' | 'Samir';
  startTime: number;
  endTime: number;
  text: string;
  words: TranscriptWord[];
}

export interface LumetriColorState {
  liftRgb: [number, number, number];    // Shadows [-100, 100]
  gammaRgb: [number, number, number];   // Midtones [-100, 100]
  gainRgb: [number, number, number];    // Highlights [-100, 100]
  exposure: number;                     // -5.0 to +5.0
  contrast: number;                     // -50 to +50
  highlights: number;                   // -100 to +100
  shadows: number;                      // -100 to +100
  temperature: number;                  // 2000K to 10000K (default 5600)
  vibrance: number;                     // -100 to +100
  activeLut: string;
  isSplitCompare: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration: number;
  resolution: string;
  fps: number;
  codec: string;
  channels: string;
  proxyStatus: 'ready' | 'generating' | 'none';
  aiBadges: string[];
  url: string;
  thumbnail: string;
}

export interface ExportConfig {
  preset: string;
  container: 'mov' | 'mp4';
  videoCodec: 'ProRes 422 HQ' | 'ProRes 4444 XQ' | 'H.265 / HEVC' | 'H.264 / AVC';
  audioCodec: 'Linear PCM 24-bit' | 'AAC 320 Kbps';
  resolution: '4K UHD (3840x2160)' | '1080p FHD (1920x1080)' | '9:16 Social (1080x1920)';
  fps: number;
  crf: number;
  targetBitrateMbps: number;
  hwAccel: 'Metal M2 Max' | 'NVIDIA NVENC' | 'WebGPU Engine';
  isBatchQueueOpen: boolean;
}

export interface BatchRenderJob {
  id: string;
  name: string;
  preset: string;
  resolution: string;
  format: string;
  progress: number;
  status: 'queued' | 'rendering' | 'completed' | 'paused' | 'failed';
  fps: number;
  eta: string;
  outputPath: string;
  fileSizeMb: number;
}

export interface TransitionItem {
  id: string;
  name: string;
  durationSec: number;
  alignment: 'center' | 'start' | 'end';
  reverse: boolean;
  type: 'cross_dissolve' | 'dip_to_black' | 'morph_cut' | 'zoom_blur';
}

export interface EffectItem {
  id: string;
  name: string;
  category: 'video' | 'audio' | 'lut';
  applied: boolean;
  paramName?: string;
  paramValue?: number;
}

export interface ProjectManifest {
  id: string;
  name: string;
  directory: string;
  resolution: string;
  fps: number;
  colorSpace: string;
  template: string;
  updatedAt: string;
  sizeGb?: number;
}
