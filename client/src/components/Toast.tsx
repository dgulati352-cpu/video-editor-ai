import React from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const Toast: React.FC = () => {
  const { toastMessage } = useTimelineStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-nle-panel/95 backdrop-blur-md border border-nle-accent/50 text-white text-xs font-mono shadow-[0_4px_24px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className="material-symbols-outlined text-nle-accent text-[18px]">
        info
      </span>
      <span>{toastMessage}</span>
    </div>
  );
};
