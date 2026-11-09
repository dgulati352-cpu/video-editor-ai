import React from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const TopBar: React.FC = () => {
  const {
    projectName,
    undo,
    redo,
    canUndo,
    canRedo,
    frameRate,
    openVoiceModal,
    setActiveTab,
    openRenderProgressModal,
    showToastBanner
  } = useTimelineStore();

  const handleBack = () => {
    showToastBanner('Navigation: Returning to project overview');
  };

  const handleExport = () => {
    setActiveTab('render');
    openRenderProgressModal();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-3 sm:px-4 h-12 w-full bg-surface-container-low/90 backdrop-blur-md border-b border-outline-variant select-none">
      {/* Leading controls: Back & Project Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleBack}
          aria-label="Back"
          className="text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform duration-150 p-1 rounded flex items-center"
          id="back-btn"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-semibold text-on-surface truncate max-w-[140px] sm:max-w-xs">
            {projectName}
          </span>
          <span className="text-[9px] text-outline font-mono tracking-wider uppercase" id="save-status">
            Auto-Saved
          </span>
        </div>
      </div>

      {/* Center: Undo, Redo, Format Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-outline-variant/40">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1 rounded active:scale-95 transition-all ${
              canUndo ? 'text-on-surface-variant hover:text-on-surface' : 'text-outline/40 cursor-not-allowed'
            }`}
            id="undo-btn"
            title="Undo"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </button>
          <div className="w-[1px] h-3 bg-outline-variant mx-1" />
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1 rounded active:scale-95 transition-all ${
              canRedo ? 'text-on-surface-variant hover:text-on-surface' : 'text-outline/40 cursor-not-allowed'
            }`}
            id="redo-btn"
            title="Redo"
          >
            <span className="material-symbols-outlined text-[18px]">redo</span>
          </button>
        </div>

        <div className="hidden xs:flex items-center px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary-fixed-dim text-[11px] font-mono">
          4K {frameRate}fps
        </div>
      </div>

      {/* Trailing: AI Copilot & Export Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={openVoiceModal}
          className="bg-surface-container border border-primary-container/60 text-primary-container text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,229,255,0.25)] hover:border-primary-container"
          title="Open Voice Dictation & AI Copilot"
        >
          <span className="material-symbols-outlined text-[18px] animate-pulse">auto_awesome</span>
          <span className="hidden sm:inline font-medium">AI Copilot</span>
        </button>

        <button
          onClick={handleExport}
          className="bg-primary-container text-on-primary-container text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-transform duration-150 shadow-[0_0_12px_rgba(0,229,255,0.35)] hover:brightness-110"
          id="export-btn"
        >
          <span className="material-symbols-outlined text-[18px]">ios_share</span>
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
