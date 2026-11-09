import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { secondsToSMPTE } from '../utils/timecode';

export const RenderProgressModal: React.FC = () => {
  const {
    isRenderProgressOpen,
    closeRenderProgressModal,
    exportConfig,
    projectName,
    showToastBanner,
  } = useTimelineStore();

  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = 7200; // 120s * 60fps
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isRenderProgressOpen) {
      setProgress(0);
      setCurrentFrame(0);
      setIsDone(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDone(true);
          return 100;
        }
        const next = prev + 2.5;
        setCurrentFrame(Math.floor((next / 100) * totalFrames));
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRenderProgressOpen]);

  if (!isRenderProgressOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-nle-surface border border-nle-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-nle-header border-b border-nle-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-nle-blue text-[20px] animate-pulse">
              ios_share
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[13px]">
                {isDone ? 'Encoding Complete' : 'Rendering Sequence Master'}
              </span>
              <span className="text-3xs font-mono text-nle-dim">{exportConfig.preset}</span>
            </div>
          </div>

          <button
            onClick={closeRenderProgressModal}
            className="p-1 rounded text-nle-dim hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Circular or Bar Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-3xs">
              <span className="text-white font-semibold">
                Frame {currentFrame} / {totalFrames}
              </span>
              <span className="text-nle-accent font-bold text-sm">{progress.toFixed(1)}%</span>
            </div>

            <div className="w-full h-3 bg-nle-canvas rounded-full overflow-hidden border border-nle-border">
              <div
                className={`h-full transition-all duration-100 ${
                  isDone ? 'bg-nle-emerald' : 'bg-gradient-to-r from-nle-blue to-nle-accent'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2 bg-nle-panel p-3 rounded border border-nle-border font-mono text-3xs">
            <div className="flex flex-col">
              <span className="text-nle-dim">Hardware Accelerator</span>
              <span className="text-white font-semibold">{exportConfig.hwAccel}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-nle-dim">Encoding FPS</span>
              <span className="text-nle-accent font-semibold">{isDone ? 'Finished' : '118.4 FPS'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-nle-dim">Format Container</span>
              <span className="text-white">{exportConfig.container.toUpperCase()} ({exportConfig.videoCodec})</span>
            </div>
            <div className="flex flex-col">
              <span className="text-nle-dim">Target Bitrate / CRF</span>
              <span className="text-white">{exportConfig.targetBitrateMbps} Mbps (CRF {exportConfig.crf})</span>
            </div>
          </div>

          {/* Output Destination */}
          <div className="flex flex-col gap-0.5 text-3xs font-mono">
            <span className="text-nle-dim uppercase">Destination Output:</span>
            <span className="text-nle-text bg-nle-panel p-1.5 rounded border border-nle-border truncate">
              /Volumes/Scratch_RAID0/Exports/{projectName.replace('.cfs', '')}.{exportConfig.container}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-nle-border">
            {isDone ? (
              <>
                <button
                  onClick={() => {
                    showToastBanner('Opened export folder in File Explorer');
                    closeRenderProgressModal();
                  }}
                  className="px-4 py-2 rounded bg-nle-panel hover:bg-nle-border text-white font-medium"
                >
                  Show in Explorer
                </button>
                <button
                  onClick={closeRenderProgressModal}
                  className="px-4 py-2 rounded bg-nle-emerald text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  Done
                </button>
              </>
            ) : (
              <button
                onClick={closeRenderProgressModal}
                className="px-4 py-2 rounded bg-nle-panel hover:bg-nle-border text-white font-medium"
              >
                Run in Background
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
