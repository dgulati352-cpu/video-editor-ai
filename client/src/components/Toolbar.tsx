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
  const {
    activeTool,
    setActiveTool,
    addTitleClip,
    showToastBanner,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTimelineStore();

  const handleToolClick = (tool: ToolDef) => {
    if (tool.id === 'zoom') {
      addTitleClip('New Title Card');
      showToastBanner('Added Title Card overlay on Track V2');
      return;
    }
    setActiveTool(tool.id);
    if (tool.id === 'razor_cut') {
      showToastBanner('Razor Tool selected (C): Click on clip or use Ctrl+K to split');
    } else if (tool.id === 'selection') {
      showToastBanner('Selection Tool (V): Move or trim clips');
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

      <div className="w-4 h-[1px] bg-[#3a3a3a] my-1" />

      {/* Undo Button */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`w-6 h-6 rounded-[3px] flex items-center justify-center transition-all ${
          canUndo
            ? 'text-[#a0a0a0] hover:text-white hover:bg-[#2e2e2e]'
            : 'text-[#444444] cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <span className="material-symbols-outlined text-[15px]">undo</span>
      </button>

      {/* Redo Button */}
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`w-6 h-6 rounded-[3px] flex items-center justify-center transition-all ${
          canRedo
            ? 'text-[#a0a0a0] hover:text-white hover:bg-[#2e2e2e]'
            : 'text-[#444444] cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
      >
        <span className="material-symbols-outlined text-[15px]">redo</span>
      </button>
    </aside>
  );
};
