import React from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { EditingTool } from '../types';

interface ToolDef {
  id: EditingTool;
  shortcut: string;
  name: string;
  icon: string;
}

const TOOLS: ToolDef[] = [
  { id: 'selection', shortcut: 'V', name: 'Selection Tool', icon: 'near_me' },
  { id: 'track_forward', shortcut: 'A', name: 'Track Select Forward', icon: 'fast_forward' },
  { id: 'ripple_edit', shortcut: 'B', name: 'Ripple Edit Tool', icon: 'swap_horiz' },
  { id: 'rolling_edit', shortcut: 'N', name: 'Rolling Edit Tool', icon: 'tune' },
  { id: 'razor_cut', shortcut: 'C', name: 'Razor Cut Tool', icon: 'content_cut' },
  { id: 'slip', shortcut: 'Y', name: 'Slip Tool', icon: 'width_normal' },
  { id: 'slide', shortcut: 'U', name: 'Slide Tool', icon: 'view_column' },
  { id: 'pen', shortcut: 'P', name: 'Pen Tool / Keyframes', icon: 'edit' },
  { id: 'hand', shortcut: 'H', name: 'Hand Tool (Pan Canvas)', icon: 'pan_tool' },
  { id: 'zoom', shortcut: 'Z', name: 'Zoom Tool', icon: 'zoom_in' },
];

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool, splitClipAtPlayhead, showToastBanner } = useTimelineStore();

  const handleToolClick = (tool: ToolDef) => {
    setActiveTool(tool.id);
    if (tool.id === 'razor_cut') {
      showToastBanner('Razor Cut selected (C): Click clip or use Ctrl+K to split');
    }
  };

  return (
    <aside className="w-10 bg-nle-surface border-r border-nle-border flex flex-col items-center py-2 gap-1 z-30 select-none">
      {TOOLS.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => handleToolClick(t)}
            className={`relative group w-8 h-8 rounded flex items-center justify-center transition-all ${
              isActive
                ? 'bg-nle-accent/20 text-nle-accent border border-nle-accent/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                : 'text-nle-dim hover:text-nle-text hover:bg-nle-panel'
            }`}
            title={`${t.name} (${t.shortcut})`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>

            {/* Micro hotkey badge */}
            <span className="absolute bottom-0.5 right-1 text-[8px] font-mono leading-none opacity-60">
              {t.shortcut}
            </span>

            {/* Hover Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-nle-panel border border-nle-border rounded shadow-xl text-3xs font-medium text-white whitespace-nowrap hidden group-hover:block z-50 pointer-events-none">
              <span className="font-semibold text-nle-text">{t.name}</span>
              <span className="ml-1.5 px-1 py-0.5 bg-nle-surface rounded border border-nle-border text-nle-accent font-mono">
                {t.shortcut}
              </span>
            </div>
          </button>
        );
      })}

      <div className="w-6 h-[1px] bg-nle-border my-1" />

      {/* Quick razor split trigger button */}
      <button
        onClick={splitClipAtPlayhead}
        className="w-8 h-8 rounded flex items-center justify-center text-nle-crimson hover:bg-nle-crimson/10 transition-colors"
        title="Razor Split at Playhead (Ctrl+K / C)"
      >
        <span className="material-symbols-outlined text-[18px]">cut</span>
      </button>
    </aside>
  );
};
