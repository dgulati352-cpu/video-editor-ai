import React from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const QuickActionBar: React.FC = () => {
  const {
    quickAutoCutSilence,
    quickAutoSubtitles,
    quickAutoColorMatch,
    quickVoiceIsolation,
    quickSocialReframe,
    openVoiceModal,
    isMediaBinOpen,
    toggleMediaBin,
    isInspectorOpen,
    toggleInspector,
    snappingEnabled,
    toggleSnapping,
    toggleKeyboardHelp,
    resolution,
    silenceState,
  } = useTimelineStore();

  const isVertical = resolution.includes('9:16');

  return (
    <div className="h-9 px-3 bg-nle-surface border-t border-b border-nle-border flex items-center justify-between text-xs select-none gap-2 shrink-0 z-20">
      {/* Left: 1-Click AI Superpowers Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
        <span className="text-[10px] font-mono text-nle-dim uppercase tracking-wider hidden lg:inline mr-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-nle-accent animate-pulse" />
          Quick Actions:
        </span>

        {/* 1. Auto Cut Silence */}
        <button
          onClick={quickAutoCutSilence}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all active:scale-95 ${
            silenceState.isPreviewActive
              ? 'bg-nle-crimson/20 border-nle-crimson/50 text-nle-crimson shadow-[0_0_8px_rgba(239,68,68,0.25)]'
              : 'bg-nle-panel border-nle-border text-white hover:border-nle-accent hover:text-nle-accent'
          }`}
          title="Detect and ripple-cut dead air & pauses across audio tracks"
        >
          <span className="material-symbols-outlined text-[15px] text-nle-amber">content_cut</span>
          <span>Auto-Cut Silence</span>
          {silenceState.cuts.length > 0 && (
            <span className="text-[9px] font-mono px-1 rounded bg-black/50 text-white">
              {silenceState.cuts.length}
            </span>
          )}
        </button>

        {/* 2. Auto Captions */}
        <button
          onClick={quickAutoSubtitles}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-nle-panel border border-nle-border text-white hover:border-nle-accent hover:text-nle-accent transition-all active:scale-95"
          title="Auto-generate word-synced subtitles on CC1 with speaker diarization"
        >
          <span className="material-symbols-outlined text-[15px] text-nle-accent">subtitles</span>
          <span>Auto Captions</span>
        </button>

        {/* 3. Auto Color Match */}
        <button
          onClick={quickAutoColorMatch}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-nle-panel border border-nle-border text-white hover:border-nle-accent hover:text-nle-accent transition-all active:scale-95"
          title="Balance exposure & skin tones and apply cinematic 35mm LUT"
        >
          <span className="material-symbols-outlined text-[15px] text-nle-purple">palette</span>
          <span>Auto Color</span>
        </button>

        {/* 4. Voice Isolation */}
        <button
          onClick={quickVoiceIsolation}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-nle-panel border border-nle-border text-white hover:border-nle-accent hover:text-nle-accent transition-all active:scale-95"
          title="Clean background room noise and AC hum with neural dialogue isolation"
        >
          <span className="material-symbols-outlined text-[15px] text-nle-emerald">mic_external_on</span>
          <span>Clean Voice</span>
        </button>

        {/* 5. 9:16 Social Reframe */}
        <button
          onClick={quickSocialReframe}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all active:scale-95 ${
            isVertical
              ? 'bg-nle-accent/20 border-nle-accent text-nle-accent font-semibold'
              : 'bg-nle-panel border-nle-border text-white hover:border-nle-accent hover:text-nle-accent'
          }`}
          title="Toggle between 16:9 4K UHD and 9:16 Social Vertical Reframe"
        >
          <span className="material-symbols-outlined text-[15px]">crop_portrait</span>
          <span>{isVertical ? '9:16 Vertical Active' : '9:16 Reframe'}</span>
        </button>

        {/* 6. AI Copilot Prompt */}
        <button
          onClick={openVoiceModal}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-gradient-to-r from-nle-accent/20 to-purple-600/20 border border-nle-accent/40 text-nle-accent hover:brightness-125 transition-all active:scale-95 shadow-[0_0_8px_rgba(0,229,255,0.15)]"
          title="Prompt the AI Copilot to cut, grade, or re-time your timeline"
        >
          <span className="material-symbols-outlined text-[15px] animate-pulse">auto_awesome</span>
          <span>AI Copilot...</span>
        </button>
      </div>

      {/* Right: Panel Toggles & Shortcuts Help */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Timeline Snapping (S) */}
        <button
          onClick={toggleSnapping}
          className={`flex items-center gap-1 px-2 py-1 rounded text-3xs font-mono border transition-all ${
            snappingEnabled
              ? 'bg-nle-accent/20 border-nle-accent/60 text-nle-accent font-semibold shadow-[0_0_6px_rgba(0,229,255,0.2)]'
              : 'bg-nle-panel border-nle-border text-nle-dim hover:text-white'
          }`}
          title="Toggle Timeline Magnetic Snapping (S)"
        >
          <span className="material-symbols-outlined text-[14px]">magnet</span>
          <span>Snap {snappingEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <div className="w-[1px] h-3.5 bg-nle-border mx-0.5" />

        {/* Media Bin Toggle */}
        <button
          onClick={toggleMediaBin}
          className={`p-1 rounded border transition-colors ${
            isMediaBinOpen
              ? 'bg-nle-border text-white border-nle-muted'
              : 'bg-nle-panel text-nle-dim hover:text-white border-nle-border'
          }`}
          title={isMediaBinOpen ? 'Collapse Media Bin' : 'Show Media Bin'}
        >
          <span className="material-symbols-outlined text-[15px]">left_panel_close</span>
        </button>

        {/* Inspector Dock Toggle */}
        <button
          onClick={toggleInspector}
          className={`p-1 rounded border transition-colors ${
            isInspectorOpen
              ? 'bg-nle-border text-white border-nle-muted'
              : 'bg-nle-panel text-nle-dim hover:text-white border-nle-border'
          }`}
          title={isInspectorOpen ? 'Collapse Inspector Dock' : 'Show Inspector Dock'}
        >
          <span className="material-symbols-outlined text-[15px]">right_panel_close</span>
        </button>

        {/* Keyboard Shortcuts Cheat Sheet (?) */}
        <button
          onClick={toggleKeyboardHelp}
          className="flex items-center gap-1 px-2 py-1 rounded bg-nle-panel hover:bg-nle-border border border-nle-border text-nle-dim hover:text-white font-mono text-3xs transition-colors"
          title="Keyboard Shortcuts Reference (?)"
        >
          <span className="material-symbols-outlined text-[14px]">keyboard</span>
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </div>
    </div>
  );
};

