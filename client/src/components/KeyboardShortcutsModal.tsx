import React from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isKeyboardHelpOpen, toggleKeyboardHelp } = useTimelineStore();

  if (!isKeyboardHelpOpen) return null;

  const categories = [
    {
      title: 'Transport & Playback',
      shortcuts: [
        { key: 'Space', desc: 'Play / Stop Toggle' },
        { key: 'J', desc: 'Play Reverse / Rewind' },
        { key: 'K', desc: 'Stop / Pause Playback' },
        { key: 'L', desc: 'Play Forward / Fast Forward (2x, 4x)' },
        { key: '← / →', desc: 'Step Back / Forward 1 Frame' },
        { key: 'Shift + ←/→', desc: 'Step 5 Frames Back / Forward' },
      ],
    },
    {
      title: 'Editing & Tools',
      shortcuts: [
        { key: 'V', desc: 'Selection Tool' },
        { key: 'C', desc: 'Razor Cut Tool / Split at Playhead' },
        { key: 'B', desc: 'Ripple Edit Tool' },
        { key: 'A', desc: 'Track Select Forward' },
        { key: 'Delete', desc: 'Clear (Delete Selected Clip)' },
        { key: 'Shift + Delete', desc: 'Ripple Delete (Close Gap)' },
      ],
    },
    {
      title: 'In / Out Range & Markers',
      shortcuts: [
        { key: 'I', desc: 'Mark In Point' },
        { key: 'O', desc: 'Mark Out Point' },
        { key: 'Ctrl + Shift + X', desc: 'Clear In and Out Points' },
        { key: 'M', desc: 'Add Marker at Playhead' },
        { key: 'S', desc: 'Toggle Magnetic Snapping' },
        { key: 'Z', desc: 'Zoom Tool (Click to zoom)' },
      ],
    },
    {
      title: 'Project & Operations',
      shortcuts: [
        { key: 'Ctrl + Z', desc: 'Undo (Snapshot Journal)' },
        { key: 'Ctrl + Shift + Z', desc: 'Redo' },
        { key: 'Ctrl + S', desc: 'Save Project Manifest (.cfs)' },
        { key: 'Ctrl + M', desc: 'Export Sequence Master' },
        { key: 'Ctrl + B', desc: 'Batch Render Queue' },
        { key: 'Ctrl + O', desc: 'Open Projects Dashboard' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-nle-surface border border-nle-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-nle-header border-b border-nle-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-nle-accent text-[20px]">keyboard</span>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[13px]">Keyboard Shortcuts & Ergonomics</span>
              <span className="text-3xs font-mono text-nle-dim">Industry Standard NLE Layout</span>
            </div>
          </div>

          <button
            onClick={toggleKeyboardHelp}
            className="p-1 rounded text-nle-dim hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-4 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
          {categories.map((cat, cIdx) => (
            <div key={cIdx} className="flex flex-col gap-2 bg-nle-panel p-3 rounded-lg border border-nle-border">
              <span className="text-3xs font-mono font-bold uppercase tracking-wider text-nle-accent">
                {cat.title}
              </span>

              <div className="flex flex-col gap-1.5">
                {cat.shortcuts.map((sc, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between text-[11px]">
                    <span className="text-nle-dim truncate">{sc.desc}</span>
                    <span className="px-1.5 py-0.5 rounded bg-nle-surface border border-nle-border font-mono text-3xs font-semibold text-white whitespace-nowrap ml-2 shadow-sm">
                      {sc.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-nle-header border-t border-nle-border flex items-center justify-between">
          <span className="text-3xs font-mono text-nle-dim">
            Press <code className="text-nle-accent font-bold">?</code> at any time to open this cheat sheet.
          </span>
          <button
            onClick={toggleKeyboardHelp}
            className="px-4 py-1.5 rounded bg-nle-accent text-black font-bold text-[11px] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
