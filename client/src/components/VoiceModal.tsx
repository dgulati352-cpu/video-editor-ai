import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const VoiceModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    closeVoiceModal,
    startSilenceAnalysis,
    showToastBanner,
  } = useTimelineStore();

  const [inputCmd, setInputCmd] = useState('');
  const [isListening, setIsListening] = useState(false);

  if (!isVoiceModalOpen) return null;

  const quickPrompts = [
    'Cut all dead air >450ms across A1 and ripple edit',
    'Auto color-match V1 clip to master reference',
    'Burn-in open captions on CC1 with word highlight',
    'Isolate dialogue on A1 and duck music bed on A8 by -14dB',
    'Export 9:16 vertical short-form teaser with punch-in zooms',
  ];

  const handleExecute = (cmd: string) => {
    showToastBanner(`AI Executing: "${cmd}"`);
    startSilenceAnalysis();
    closeVoiceModal();
  };

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      showToastBanner('Listening to voice dictation...');
      setTimeout(() => {
        setInputCmd('Cut all dead air >450ms across A1 and ripple edit');
        setIsListening(false);
      }, 1600);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-nle-panel border border-nle-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-nle-header border-b border-nle-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-nle-accent text-[20px] animate-pulse">
              auto_awesome
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[13px]">AI Copilot Studio & Voice Dictation</span>
              <span className="text-3xs font-mono text-nle-dim">Local WebGPU / CoreML Neural Pipeline</span>
            </div>
          </div>

          <button
            onClick={closeVoiceModal}
            className="p-1 rounded text-nle-dim hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* Voice Mic Pulsing Circle */}
          <div className="flex flex-col items-center justify-center py-4 bg-nle-surface border border-nle-border rounded-lg">
            <button
              onClick={toggleMic}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-nle-crimson text-white scale-110 shadow-[0_0_24px_rgba(239,68,68,0.5)] animate-pulse'
                  : 'bg-nle-accent text-black hover:scale-105 shadow-[0_0_16px_rgba(0,229,255,0.3)]'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isListening ? 'graphic_eq' : 'mic'}
              </span>
            </button>
            <span className="mt-2 text-3xs font-mono text-nle-dim">
              {isListening ? 'Listening (Speak timeline instructions)...' : 'Click to dictate voice instruction'}
            </span>
          </div>

          {/* Prompt Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputCmd.trim()) handleExecute(inputCmd);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="e.g. Cut all dead air >450ms across A1 and ripple edit..."
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              className="flex-1 bg-nle-surface border border-nle-border rounded px-3 py-2 text-[12px] text-white focus:outline-none focus:border-nle-accent placeholder:text-nle-muted"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-nle-accent hover:brightness-110 text-black font-bold active:scale-95 transition-all"
            >
              Execute
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-col gap-1.5">
            <span className="text-3xs uppercase font-mono text-nle-dim tracking-wider">
              Autonomous Timeline Recipes
            </span>
            <div className="flex flex-col gap-1">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecute(qp)}
                  className="px-3 py-2 rounded bg-nle-surface hover:bg-nle-border border border-nle-border text-left text-nle-text hover:text-white font-mono text-[11px] transition-colors flex items-center justify-between"
                >
                  <span>{qp}</span>
                  <span className="material-symbols-outlined text-[14px] text-nle-accent">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
