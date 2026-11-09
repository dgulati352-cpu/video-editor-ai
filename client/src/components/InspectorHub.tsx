import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { formatDuration } from '../utils/timecode';

export const InspectorHub: React.FC = () => {
  const {
    activeWorkspace,
    setActiveWorkspace,
    silenceState,
    setSilenceThreshold,
    setMinPauseSec,
    startSilenceAnalysis,
    toggleSilencePreview,
    applySilenceCuts,
    discardSilenceCuts,
    transcript,
    filterFillerWords,
    toggleFilterFillerWords,
    jumpToWord,
    editTranscriptWord,
    exportSubtitles,
    colorState,
    updateColorParam,
    resetColorGrading,
    applyLutPreset,
    transitions,
    activeTransition,
    setTransitionAlignment,
    setTransitionDuration,
    effects,
    toggleEffect,
    exportConfig,
    updateExportConfig,
    addToBatchQueue,
    openRenderProgressModal,
    showToastBanner,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'transcript' | 'color' | 'effects' | 'export'>(
    activeWorkspace === 'color' ? 'color' : activeWorkspace === 'audio' ? 'ai' : 'ai'
  );

  const [nlCommand, setNlCommand] = useState('');
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingWordText, setEditingWordText] = useState('');

  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlCommand.trim()) return;
    showToastBanner(`AI Executing: "${nlCommand}"`);
    startSilenceAnalysis();
    setNlCommand('');
  };

  const lutPresets = [
    'None',
    'Film Look: Teal & Orange 35mm',
    'Arri Alexa 709 High Contrast',
    'Fuji Eterna 3513 Print',
    'Bleach Bypass Noir',
  ];

  return (
    <div className="flex flex-col h-full bg-nle-surface border-l border-nle-border text-xs select-none">
      {/* Inspector Top Tabs */}
      <div className="flex items-center justify-between px-2 h-9 bg-nle-header border-b border-nle-border overflow-x-auto">
        <div className="flex items-center gap-1">
          {[
            { id: 'ai', label: 'AI Copilot', icon: 'auto_awesome' },
            { id: 'transcript', label: 'Transcript', icon: 'subtitles' },
            { id: 'color', label: 'Lumetri Color', icon: 'palette' },
            { id: 'effects', label: 'Effects & Transitions', icon: 'auto_fix_high' },
            { id: 'export', label: 'Export Suite', icon: 'ios_share' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-nle-panel text-nle-accent border border-nle-border shadow-sm font-semibold'
                    : 'text-nle-dim hover:text-nle-text'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* TAB 1: AI COPILOT & SILENCE REMOVAL */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-3">
            {/* Natural Language Prompt */}
            <form onSubmit={handleNlSubmit} className="flex flex-col gap-1.5">
              <label className="text-3xs uppercase tracking-wider text-nle-dim font-mono flex items-center justify-between">
                <span>Natural Language Timeline Prompt</span>
                <span className="text-nle-accent font-semibold">WebGPU Neural Core</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder='Try: "Cut all dead air >450ms across A1 and ripple edit"'
                  value={nlCommand}
                  onChange={(e) => setNlCommand(e.target.value)}
                  className="w-full bg-nle-panel border border-nle-border rounded px-3 py-1.5 text-[11px] text-nle-text focus:outline-none focus:border-nle-accent"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 px-2 py-0.5 rounded bg-nle-accent text-black font-semibold text-3xs hover:brightness-110 active:scale-95 transition-all"
                >
                  Execute
                </button>
              </div>
            </form>

            {/* Silence Removal Telemetry Box */}
            <div className="bg-nle-panel border border-nle-border rounded p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[11px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-nle-amber text-[16px]">hearing</span>
                  AI Silence & Dead Air Removal
                </span>
                <span className="text-3xs font-mono px-1.5 py-0.2 rounded bg-nle-emerald/10 text-nle-emerald border border-nle-emerald/20">
                  {silenceState.cuts.length} Cuts Detected (8.9s)
                </span>
              </div>

              {/* 4-Stage Multi-stage Telemetry */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-3xs text-nle-dim font-mono">
                  <span>Pipeline Telemetry Progress</span>
                  <span className="text-nle-accent">Stage {silenceState.stage} of 4</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { step: 1, name: 'Spectral Denoise' },
                    { step: 2, name: 'Gap Detection' },
                    { step: 3, name: 'Marker Gen' },
                    { step: 4, name: 'Ripple Preview' },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`h-1.5 rounded-full transition-all ${
                        silenceState.stage >= s.step ? 'bg-nle-accent' : 'bg-nle-border'
                      }`}
                      title={s.name}
                    />
                  ))}
                </div>
              </div>

              {/* Threshold & Pause Sliders */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-3xs text-nle-dim font-mono">
                    <span>Noise Gate</span>
                    <span className="text-white">{silenceState.thresholdDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="-10"
                    step="1"
                    value={silenceState.thresholdDb}
                    onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                    className="w-full h-1 bg-nle-border rounded appearance-none cursor-pointer accent-nle-accent"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-3xs text-nle-dim font-mono">
                    <span>Min Pause</span>
                    <span className="text-white">{silenceState.minPauseSec}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={silenceState.minPauseSec}
                    onChange={(e) => setMinPauseSec(Number(e.target.value))}
                    className="w-full h-1 bg-nle-border rounded appearance-none cursor-pointer accent-nle-accent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={startSilenceAnalysis}
                  disabled={silenceState.isAnalyzing}
                  className="flex-1 py-1.5 rounded bg-nle-surface hover:bg-nle-border border border-nle-border text-white text-[11px] font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[15px] ${silenceState.isAnalyzing ? 'animate-spin' : ''}`}>
                    {silenceState.isAnalyzing ? 'sync' : 'search'}
                  </span>
                  <span>{silenceState.isAnalyzing ? 'Analyzing Audio...' : 'Re-Analyze Audio'}</span>
                </button>

                <button
                  onClick={applySilenceCuts}
                  className="flex-1 py-1.5 rounded bg-nle-accent hover:brightness-110 text-black text-[11px] font-bold active:scale-95 transition-all shadow-[0_0_10px_rgba(0,229,255,0.25)]"
                >
                  Apply Ripple Cuts
                </button>
              </div>

              {/* Detected Cuts List */}
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto mt-1 border-t border-nle-border pt-2">
                <span className="text-3xs uppercase tracking-wider text-nle-dim font-mono">
                  Silence Cuts Preview Overlay
                </span>
                {silenceState.cuts.map((cut) => (
                  <div
                    key={cut.id}
                    className="flex items-center justify-between p-1.5 bg-nle-surface border border-nle-border/60 rounded text-3xs font-mono"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="px-1 py-0.2 rounded bg-nle-crimson/20 border border-nle-crimson/40 text-nle-crimson font-bold">
                        DEL
                      </span>
                      <span className="text-white font-semibold">
                        {formatDuration(cut.startTime)} → {formatDuration(cut.endTime)}
                      </span>
                      <span className="text-nle-dim">({cut.duration.toFixed(1)}s)</span>
                    </div>

                    <span className="text-nle-amber capitalize">
                      {cut.reason.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neural Voice Isolation Card */}
            <div className="bg-nle-panel border border-nle-border rounded p-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-white text-[11px]">Spectral Dialogue Isolation</span>
                <span className="text-3xs text-nle-dim">Removes ambient room rumble & AC hum (CoreML)</span>
              </div>
              <button
                onClick={() => showToastBanner('Toggled Spectral Voice Isolation: 100% Non-destructive')}
                className="px-2.5 py-1 rounded bg-nle-emerald/20 border border-nle-emerald/40 text-nle-emerald font-semibold text-3xs hover:bg-nle-emerald/30 transition-all"
              >
                Enabled (-18 dB)
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE TRANSCRIPT & DIARIZATION */}
        {activeTab === 'transcript' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-[11px]">Word-Level Diarization</span>
                <span className="text-3xs font-mono text-nle-dim">3 Speakers</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFilterFillerWords}
                  className={`px-2 py-0.5 rounded text-3xs font-mono border transition-all ${
                    filterFillerWords
                      ? 'bg-nle-amber/20 border-nle-amber text-nle-amber font-semibold'
                      : 'bg-nle-panel border-nle-border text-nle-dim'
                  }`}
                  title="Highlight filler words like 'um', 'uh'"
                >
                  Filler Words Highlight
                </button>

                <button
                  onClick={() => exportSubtitles('vtt')}
                  className="px-2 py-0.5 rounded bg-nle-accent/20 border border-nle-accent/40 text-nle-accent text-3xs font-mono hover:bg-nle-accent/30"
                  title="Export Subtitles (.vtt)"
                >
                  Export .vtt
                </button>
              </div>
            </div>

            {/* Transcript Item Blocks */}
            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
              {transcript.map((item) => (
                <div
                  key={item.id}
                  className="bg-nle-panel border border-nle-border rounded p-2.5 flex flex-col gap-1.5"
                >
                  {/* Speaker Header */}
                  <div className="flex items-center justify-between text-3xs font-mono">
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold ${
                        item.speaker === 'Elena'
                          ? 'bg-nle-emerald/20 text-nle-emerald border border-nle-emerald/30'
                          : item.speaker === 'Marcus'
                          ? 'bg-nle-accent/20 text-nle-accent border border-nle-accent/30'
                          : 'bg-nle-purple/20 text-nle-purple border border-nle-purple/30'
                      }`}
                    >
                      {item.speaker}
                    </span>
                    <span className="text-nle-dim">
                      {formatDuration(item.startTime)} - {formatDuration(item.endTime)}
                    </span>
                  </div>

                  {/* Word-level tokens */}
                  <div className="flex flex-wrap gap-1 leading-relaxed text-[11px]">
                    {item.words.map((w) => {
                      const isFiller = w.isFiller && filterFillerWords;
                      return (
                        <span
                          key={w.id}
                          onClick={() => jumpToWord(w.start)}
                          onDoubleClick={() => {
                            setEditingWordId(w.id);
                            setEditingWordText(w.word);
                          }}
                          className={`px-1 py-0.2 rounded cursor-pointer transition-all ${
                            isFiller
                              ? 'bg-nle-amber/30 text-nle-amber font-semibold border border-nle-amber/50 line-through'
                              : 'hover:bg-nle-accent/20 text-nle-text hover:text-nle-accent'
                          }`}
                          title={`Click to jump to ${w.start.toFixed(2)}s | Double-click to edit`}
                        >
                          {editingWordId === w.id ? (
                            <input
                              type="text"
                              autoFocus
                              value={editingWordText}
                              onChange={(e) => setEditingWordText(e.target.value)}
                              onBlur={() => {
                                editTranscriptWord(item.id, w.id, editingWordText);
                                setEditingWordId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  editTranscriptWord(item.id, w.id, editingWordText);
                                  setEditingWordId(null);
                                }
                              }}
                              className="w-16 bg-black border border-nle-accent text-white px-1 text-3xs"
                            />
                          ) : (
                            w.word
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LUMETRI COLOR WHEELS */}
        {activeTab === 'color' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-[11px]">Color Wheels & Look Presets</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateColorParam('isSplitCompare', !colorState.isSplitCompare)}
                  className={`px-2 py-0.5 rounded text-3xs font-mono border ${
                    colorState.isSplitCompare
                      ? 'bg-nle-accent/20 border-nle-accent text-nle-accent font-semibold'
                      : 'bg-nle-panel border-nle-border text-nle-dim'
                  }`}
                >
                  Split Compare
                </button>
                <button
                  onClick={resetColorGrading}
                  className="text-3xs text-nle-dim hover:text-white"
                  title="Reset to Neutral"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* LUT Preset Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-3xs text-nle-dim uppercase font-mono">Look / 3D LUT</label>
              <select
                value={colorState.activeLut}
                onChange={(e) => applyLutPreset(e.target.value)}
                className="bg-nle-panel border border-nle-border rounded px-2 py-1 text-[11px] text-nle-text focus:outline-none focus:border-nle-accent"
              >
                {lutPresets.map((lut) => (
                  <option key={lut} value={lut}>
                    {lut}
                  </option>
                ))}
              </select>
            </div>

            {/* 3-Way Color Wheels (Lift, Gamma, Gain) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { name: 'Lift (Shadows)', rgb: colorState.liftRgb, key: 'liftRgb' as const },
                { name: 'Gamma (Midtones)', rgb: colorState.gammaRgb, key: 'gammaRgb' as const },
                { name: 'Gain (Highlights)', rgb: colorState.gainRgb, key: 'gainRgb' as const },
              ].map((wheel) => (
                <div key={wheel.name} className="flex flex-col items-center gap-1 bg-nle-panel p-2 rounded border border-nle-border">
                  <span className="text-3xs text-nle-dim font-mono">{wheel.name}</span>
                  {/* Color Circle Graphic */}
                  <div className="relative w-16 h-16 rounded-full border border-nle-border bg-gradient-to-tr from-cyan-900/40 via-purple-900/40 to-amber-900/40 flex items-center justify-center cursor-crosshair">
                    <div
                      className="w-3 h-3 rounded-full bg-white shadow-[0_0_6px_#fff] border border-black absolute"
                      style={{
                        transform: `translate(${wheel.rgb[0] * 2}px, ${wheel.rgb[1] * 2}px)`,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-nle-dim">
                    R:{wheel.rgb[0]} G:{wheel.rgb[1]} B:{wheel.rgb[2]}
                  </span>
                </div>
              ))}
            </div>

            {/* Primary Sliders */}
            <div className="flex flex-col gap-2 pt-1 font-mono text-3xs">
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-nle-dim">
                  <span>Exposure</span>
                  <span className="text-white">{colorState.exposure.toFixed(2)} EV</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.05"
                  value={colorState.exposure}
                  onChange={(e) => updateColorParam('exposure', Number(e.target.value))}
                  className="w-full h-1 bg-nle-border rounded appearance-none accent-nle-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-nle-dim">
                  <span>Contrast</span>
                  <span className="text-white">{colorState.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={colorState.contrast}
                  onChange={(e) => updateColorParam('contrast', Number(e.target.value))}
                  className="w-full h-1 bg-nle-border rounded appearance-none accent-nle-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-nle-dim">
                  <span>Temperature</span>
                  <span className="text-white">{colorState.temperature}K</span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="9000"
                  step="100"
                  value={colorState.temperature}
                  onChange={(e) => updateColorParam('temperature', Number(e.target.value))}
                  className="w-full h-1 bg-nle-border rounded appearance-none accent-nle-accent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EFFECTS & TRANSITIONS */}
        {activeTab === 'effects' && (
          <div className="flex flex-col gap-3">
            {/* Transition Inspector */}
            <div className="bg-nle-panel border border-nle-border rounded p-3 flex flex-col gap-2.5">
              <span className="font-semibold text-white text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-nle-accent text-[16px]">animation</span>
                Interactive Transition Inspector
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-3xs text-nle-dim font-mono">Transition Type</label>
                <select
                  value={activeTransition.id}
                  className="bg-nle-surface border border-nle-border rounded px-2 py-1 text-[11px] text-nle-text"
                >
                  {transitions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cut Alignment */}
              <div className="flex flex-col gap-1">
                <label className="text-3xs text-nle-dim font-mono">Cut Alignment</label>
                <div className="grid grid-cols-3 gap-1 bg-nle-surface p-0.5 rounded border border-nle-border text-3xs font-mono">
                  {(['start', 'center', 'end'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setTransitionAlignment(align)}
                      className={`py-1 rounded capitalize transition-all ${
                        activeTransition.alignment === align
                          ? 'bg-nle-panel text-nle-accent font-semibold border border-nle-border'
                          : 'text-nle-dim hover:text-white'
                      }`}
                    >
                      {align} at Cut
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-3xs font-mono text-nle-dim">
                  <span>Duration</span>
                  <span className="text-white">{activeTransition.durationSec}s ({(activeTransition.durationSec * 60).toFixed(0)} frames)</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={activeTransition.durationSec}
                  onChange={(e) => setTransitionDuration(Number(e.target.value))}
                  className="w-full h-1 bg-nle-border rounded appearance-none accent-nle-accent cursor-pointer"
                />
              </div>
            </div>

            {/* Audio & Video FX List */}
            <div className="flex flex-col gap-1.5">
              <span className="text-3xs uppercase tracking-wider text-nle-dim font-mono">
                Applied Clip FX Stack
              </span>
              {effects.map((fx) => (
                <div
                  key={fx.id}
                  className="flex items-center justify-between p-2 bg-nle-panel border border-nle-border rounded text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleEffect(fx.id)}
                      className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                        fx.applied
                          ? 'bg-nle-accent border-nle-accent text-black'
                          : 'border-nle-border text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                    </button>
                    <span className={fx.applied ? 'text-white font-medium' : 'text-nle-dim'}>
                      {fx.name}
                    </span>
                  </div>

                  {fx.paramName && (
                    <span className="text-3xs font-mono text-nle-dim">
                      {fx.paramName}: {fx.paramValue}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EXPORT & RENDER SUITE */}
        {activeTab === 'export' && (
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-white text-[11px]">Render & Multi-Format Encoder</span>

            {/* Presets */}
            <div className="flex flex-col gap-1">
              <label className="text-3xs text-nle-dim font-mono">Export Preset Profile</label>
              <select
                value={exportConfig.preset}
                onChange={(e) => updateExportConfig('preset', e.target.value)}
                className="bg-nle-panel border border-nle-border rounded px-2 py-1 text-[11px] text-nle-text"
              >
                <option value="ProRes 422 HQ Broadcast Master">ProRes 422 HQ Broadcast Master</option>
                <option value="YouTube 4K UHD Master">YouTube 4K UHD Master (H.264 / 85Mbps)</option>
                <option value="Social Reels 9:16 Vertical">Social Reels 9:16 Vertical (H.265 CRF 18)</option>
                <option value="Vimeo 1080p High Quality">Vimeo 1080p High Quality</option>
              </select>
            </div>

            {/* Codec & Container */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-3xs text-nle-dim font-mono">Format Container</label>
                <select
                  value={exportConfig.container}
                  onChange={(e) => updateExportConfig('container', e.target.value as any)}
                  className="bg-nle-panel border border-nle-border rounded px-2 py-1 text-[11px] text-nle-text"
                >
                  <option value="mov">QuickTime (.mov)</option>
                  <option value="mp4">MPEG-4 (.mp4)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-3xs text-nle-dim font-mono">Video Codec</label>
                <select
                  value={exportConfig.videoCodec}
                  onChange={(e) => updateExportConfig('videoCodec', e.target.value as any)}
                  className="bg-nle-panel border border-nle-border rounded px-2 py-1 text-[11px] text-nle-text"
                >
                  <option value="ProRes 422 HQ">Apple ProRes 422 HQ</option>
                  <option value="ProRes 4444 XQ">Apple ProRes 4444 XQ</option>
                  <option value="H.265 / HEVC">H.265 / HEVC</option>
                  <option value="H.264 / AVC">H.264 / AVC</option>
                </select>
              </div>
            </div>

            {/* CRF Slider */}
            <div className="flex flex-col gap-1 font-mono text-3xs">
              <div className="flex justify-between text-nle-dim">
                <span>Constant Rate Factor (CRF)</span>
                <span className="text-white">{exportConfig.crf} (Visual Lossless)</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                step="1"
                value={exportConfig.crf}
                onChange={(e) => updateExportConfig('crf', Number(e.target.value))}
                className="w-full h-1 bg-nle-border rounded appearance-none accent-nle-accent cursor-pointer"
              />
            </div>

            {/* Hardware Acceleration telemetry */}
            <div className="p-2.5 rounded bg-nle-panel border border-nle-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-nle-emerald text-[16px]">memory</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-3xs">{exportConfig.hwAccel}</span>
                  <span className="text-[9px] text-nle-dim">Hardware Metal / NVENC Active</span>
                </div>
              </div>
              <span className="text-3xs font-mono text-nle-accent">~120 FPS Encoding</span>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={addToBatchQueue}
                className="flex-1 py-2 rounded bg-nle-surface hover:bg-nle-panel border border-nle-border text-white text-[11px] font-semibold active:scale-95 transition-all"
              >
                Add to Batch Queue
              </button>
              <button
                onClick={openRenderProgressModal}
                className="flex-1 py-2 rounded bg-nle-blue hover:bg-nle-blue/90 text-white text-[11px] font-bold active:scale-95 transition-all shadow-[0_0_12px_rgba(13,153,255,0.3)]"
              >
                Start Direct Render
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
