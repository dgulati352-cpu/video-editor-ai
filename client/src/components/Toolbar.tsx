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
  { id: 'track_forward', shortcut: 'A', name: 'Track Select Forward Tool', icon: 'fast_forward' },
  { id: 'ripple_edit', shortcut: 'B', name: 'Ripple Edit Tool', icon: 'swap_horiz' },
  { id: 'razor_cut', shortcut: 'C', name: 'Razor Tool', icon: 'content_cut' },
  { id: 'slip', shortcut: 'Y', name: 'Slip Tool', icon: 'width_normal' },
  { id: 'pen', shortcut: 'P', name: 'Pen Tool', icon: 'edit' },
  { id: 'hand', shortcut: 'H', name: 'Hand Tool', icon: 'pan_tool' },
  { id: 'zoom', shortcut: 'T', name: 'Type Tool', icon: 'title' },
];

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool, splitClipAtPlayhead, showToastBanner } = useTimelineStore();

  const handleToolClick = (tool: ToolDef) => {
    setActiveTool(tool.id);
    if (tool.id === 'razor_cut') {
      showToastBanner('Razor Tool selected (C): Click clip or use Ctrl+K to split');
    }
  };

  return (
    <aside className="w-8 bg-[#222222] border-r border-[#303030] flex flex-col items-center py-1.5 gap-0.5 z-30 select-none shrink-0">
      {TOOLS.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => handleToolClick(t)}
            className={`w-6 h-6 rounded-[3px] flex items-center justify-center transition-all ${
              isActive
                ? 'bg-[#1473e6] text-white shadow-sm'
                : 'text-[#a0a0a0] hover:text-white hover:bg-[#2e2e2e]'
            }`}
            title={`${t.name} (${t.shortcut})`}
          >
            <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
          </button>
        );
      })}
    </aside>
  );
};
