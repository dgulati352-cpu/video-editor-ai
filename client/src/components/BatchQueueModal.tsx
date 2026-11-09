import React from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const BatchQueueModal: React.FC = () => {
  const {
    isBatchQueueOpen,
    setBatchQueueOpen,
    batchJobs,
    toggleBatchJobStatus,
    removeBatchJob,
    showToastBanner,
  } = useTimelineStore();

  if (!isBatchQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-nle-surface border border-nle-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-nle-header border-b border-nle-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-nle-accent text-[20px]">queue_play_next</span>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[13px]">Background Batch Render Queue</span>
              <span className="text-3xs font-mono text-nle-dim">Non-Blocking WebGPU / NVENC Engine</span>
            </div>
          </div>

          <button
            onClick={() => setBatchQueueOpen(false)}
            className="p-1 rounded text-nle-dim hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 flex flex-col gap-3 max-h-[460px] overflow-y-auto">
          {batchJobs.length === 0 ? (
            <div className="py-12 text-center text-nle-dim font-mono text-3xs">
              No jobs currently in batch render queue.
            </div>
          ) : (
            batchJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 bg-nle-panel border border-nle-border rounded-lg flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        job.status === 'completed'
                          ? 'bg-nle-emerald'
                          : job.status === 'rendering'
                          ? 'bg-nle-accent animate-ping'
                          : job.status === 'paused'
                          ? 'bg-nle-amber'
                          : 'bg-nle-dim'
                      }`}
                    />
                    <span className="font-semibold text-white text-[12px]">{job.name}</span>
                    <span className="text-3xs font-mono text-nle-dim uppercase">
                      ({job.preset})
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {job.status === 'rendering' && (
                      <button
                        onClick={() => toggleBatchJobStatus(job.id)}
                        className="px-2 py-0.5 rounded bg-nle-surface hover:bg-nle-border text-3xs font-mono text-white"
                      >
                        Pause
                      </button>
                    )}
                    {job.status === 'paused' && (
                      <button
                        onClick={() => toggleBatchJobStatus(job.id)}
                        className="px-2 py-0.5 rounded bg-nle-accent text-black font-bold text-3xs font-mono"
                      >
                        Resume
                      </button>
                    )}
                    {job.status === 'completed' && (
                      <button
                        onClick={() => showToastBanner(`Opening file location: ${job.outputPath}`)}
                        className="px-2 py-0.5 rounded bg-nle-surface hover:bg-nle-border text-3xs font-mono text-nle-accent"
                      >
                        Locate File
                      </button>
                    )}
                    <button
                      onClick={() => removeBatchJob(job.id)}
                      className="text-nle-dim hover:text-nle-crimson p-0.5"
                      title="Remove Job"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-nle-canvas h-2 rounded-full overflow-hidden border border-nle-border/40">
                  <div
                    className={`h-full transition-all duration-300 ${
                      job.status === 'completed'
                        ? 'bg-nle-emerald'
                        : job.status === 'paused'
                        ? 'bg-nle-amber'
                        : 'bg-nle-accent'
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>

                {/* Telemetry Row */}
                <div className="flex items-center justify-between text-3xs font-mono text-nle-dim">
                  <span>{job.format} • {job.resolution}</span>
                  <span>{job.progress}% Complete</span>
                  <span>{job.fps > 0 ? `${job.fps.toFixed(1)} FPS` : 'Idle'}</span>
                  <span className="text-white font-semibold">{job.eta}</span>
                  <span>{job.fileSizeMb} MB</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-nle-header border-t border-nle-border flex items-center justify-between">
          <span className="text-3xs font-mono text-nle-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-nle-emerald" />
            Background Metal Engine: 0% UI frame drops guaranteed
          </span>
          <button
            onClick={() => setBatchQueueOpen(false)}
            className="px-3 py-1 rounded bg-nle-panel hover:bg-nle-border text-white text-[11px] font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
