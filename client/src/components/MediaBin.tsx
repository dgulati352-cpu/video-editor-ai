import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { MediaAsset } from '../types';
import { formatDuration } from '../utils/timecode';

export const MediaBin: React.FC = () => {
  const { mediaAssets, insertAssetAtPlayhead, showToastBanner, projectName } = useTimelineStore();
  const [activeTab, setActiveTab] = useState<'project' | 'browser'>('project');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [hoverScrubMap, setHoverScrubMap] = useState<Record<string, number>>({});

  const filteredAssets = mediaAssets.filter((asset) => {
    return asset.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleHoverScrub = (e: React.MouseEvent<HTMLDivElement>, assetId: string, duration: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverScrubMap((prev) => ({ ...prev, [assetId]: ratio * duration }));
  };

  const handleInsertClip = (asset: MediaAsset) => {
    insertAssetAtPlayhead(asset.id);
    showToastBanner(`Added "${asset.name}" to sequence`);
  };

  const handleImportClick = () => {
    showToastBanner('Import Media: Select video/audio files (.mov, .mp4, .wav)');
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#303030] text-xs select-none overflow-hidden">
      {/* Tab Header Bar (Project: Untitled ≡ | Media Browser) */}
      <div className="flex items-center justify-between px-2 h-7 bg-[#252525] border-b border-[#303030]">
        <div className="flex items-center gap-3">
          {/* Project Tab */}
          <button
            onClick={() => setActiveTab('project')}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
              activeTab === 'project'
                ? 'text-white border-b-2 border-[#1473e6] pb-1'
                : 'text-[#999999] hover:text-white'
            }`}
          >
            <span>Project: Untitled</span>
            <span className="text-[#888888] text-[10px]">≡</span>
          </button>

          {/* Media Browser Tab */}
          <button
            onClick={() => setActiveTab('browser')}
            className={`text-[11px] font-medium transition-colors ${
              activeTab === 'browser'
                ? 'text-white border-b-2 border-[#1473e6] pb-1'
                : 'text-[#999999] hover:text-white'
            }`}
          >
            Media Browser
          </button>
        </div>
      </div>

      {/* Subheader: Breadcrumb (📁 Untitled.prproj) */}
      <div className="px-3 py-1 bg-[#222222] border-b border-[#2d2d2d] flex items-center justify-between text-[11px] text-[#a0a0a0]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">folder</span>
          <span className="text-[#b0b0b0] font-sans">Untitled.prproj</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-3 py-1.5 bg-[#202020] border-b border-[#2d2d2d] flex items-center gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-2 top-1.5 text-[13px] text-[#888888]">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#181818] border border-[#353535] rounded-sm pl-6 pr-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#1473e6] placeholder:text-[#666666]"
          />
        </div>
        <button
          onClick={handleImportClick}
          className="w-6 h-6 rounded hover:bg-[#2d2d2d] flex items-center justify-center text-[#999999] hover:text-white"
          title="Import Options"
        >
          <span className="material-symbols-outlined text-[15px]">filter_list</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-center">
        {filteredAssets.length === 0 ? (
          /* Empty State Matching Real Premiere Pro Screenshot */
          <div className="flex flex-col items-center justify-center text-center my-auto py-6">
            <div className="w-12 h-12 rounded-lg bg-[#282828] border border-[#383838] flex items-center justify-center text-[#888888] mb-3">
              <span className="material-symbols-outlined text-[24px]">create_new_folder</span>
            </div>
            <span className="font-semibold text-white text-[13px] mb-1">
              Add your media
            </span>
            <span className="text-[11px] text-[#888888] max-w-[200px] mb-4">
              Drag media here or import media to begin
            </span>
            <button
              onClick={handleImportClick}
              className="px-4 py-1.5 rounded-[3px] bg-[#1473e6] hover:bg-[#005fb8] text-white text-[12px] font-medium transition-colors shadow-sm"
            >
              Import media
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2 h-full content-start">
            {filteredAssets.map((asset) => {
              const scrubTime = hoverScrubMap[asset.id] ?? 0;
              return (
                <div
                  key={asset.id}
                  onClick={() => handleInsertClip(asset)}
                  onMouseMove={(e) => handleHoverScrub(e, asset.id, asset.duration)}
                  onMouseLeave={() =>
                    setHoverScrubMap((prev) => {
                      const next = { ...prev };
                      delete next[asset.id];
                      return next;
                    })
                  }
                  className="group relative bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] hover:border-[#1473e6] rounded-[3px] overflow-hidden cursor-pointer transition-all flex flex-col"
                  title="Click to insert clip into timeline"
                >
                  <div className="aspect-[16/9] w-full bg-black relative overflow-hidden flex items-center justify-center">
                    {asset.thumbnail ? (
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[28px] text-[#555555]">
                        movie
                      </span>
                    )}

                    {/* Duration badge */}
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-white">
                      {hoverScrubMap[asset.id] !== undefined
                        ? formatDuration(scrubTime)
                        : formatDuration(asset.duration)}
                    </span>
                  </div>

                  <div className="p-1.5 flex flex-col">
                    <span className="font-medium text-[#e1e1e1] text-[10px] truncate" title={asset.name}>
                      {asset.name}
                    </span>
                    <span className="text-[9px] text-[#888888] font-mono">
                      {asset.resolution} • {asset.fps} fps
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleInsertClip(asset)}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#2a2a2a] cursor-pointer text-[11px] border-b border-[#2d2d2d]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[15px] text-[#1473e6]">
                    movie
                  </span>
                  <span className="text-[#e1e1e1] truncate">{asset.name}</span>
                </div>
                <span className="text-[10px] font-mono text-[#888888]">
                  {formatDuration(asset.duration)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar: List/Grid Toggles & Zoom Slider */}
      <div className="h-7 bg-[#222222] border-t border-[#2d2d2d] px-2 flex items-center justify-between text-[11px] text-[#888888]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${
              viewMode === 'list' ? 'text-white bg-[#2d2d2d]' : 'text-[#888888] hover:text-white'
            }`}
            title="List View"
          >
            <span className="material-symbols-outlined text-[14px]">view_list</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${
              viewMode === 'grid' ? 'text-white bg-[#2d2d2d]' : 'text-[#888888] hover:text-white'
            }`}
            title="Icon View"
          >
            <span className="material-symbols-outlined text-[14px]">grid_view</span>
          </button>
          <button
            className="p-1 rounded text-[#888888] hover:text-white"
            title="Freeform View"
          >
            <span className="material-symbols-outlined text-[14px]">dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="5"
            defaultValue="2"
            className="w-16 h-1 bg-[#353535] rounded appearance-none accent-[#1473e6] cursor-pointer"
            title="Thumbnail Size"
          />
        </div>
      </div>
    </div>
  );
};
