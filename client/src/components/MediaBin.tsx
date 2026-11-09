import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { MediaAsset } from '../types';
import { formatDuration } from '../utils/timecode';

export const MediaBin: React.FC = () => {
  const { mediaAssets, showToastBanner } = useTimelineStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio'>('all');
  const [search, setSearch] = useState('');
  const [hoverScrubMap, setHoverScrubMap] = useState<Record<string, number>>({});

  const filteredAssets = mediaAssets.filter((asset) => {
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleHoverScrub = (e: React.MouseEvent<HTMLDivElement>, assetId: string, duration: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverScrubMap((prev) => ({ ...prev, [assetId]: ratio * duration }));
  };

  const handleInsertClip = (asset: MediaAsset) => {
    showToastBanner(`Inserted "${asset.name}" into Timeline at playhead`);
  };

  return (
    <div className="flex flex-col h-full bg-nle-surface border-r border-nle-border text-xs select-none">
      {/* Media Bin Header */}
      <div className="flex items-center justify-between px-3 h-8 bg-nle-header border-b border-nle-border">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-nle-accent">video_library</span>
          <span className="font-semibold text-nle-text text-[11px] uppercase tracking-wider">
            Media Bin / Project Assets
          </span>
          <span className="px-1.5 py-0.2 rounded bg-nle-panel border border-nle-border text-3xs font-mono text-nle-dim">
            {filteredAssets.length} items
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-nle-border text-nle-text' : 'text-nle-dim hover:text-nle-text'}`}
            title="Grid View"
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-nle-border text-nle-text' : 'text-nle-dim hover:text-nle-text'}`}
            title="List View with Metadata"
          >
            <span className="material-symbols-outlined text-[15px]">view_list</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-2 border-b border-nle-border bg-nle-canvas flex items-center gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-2 top-1.5 text-[14px] text-nle-dim">
            search
          </span>
          <input
            type="text"
            placeholder="Search footage, codecs, proxies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nle-surface border border-nle-border rounded pl-7 pr-2 py-1 text-[11px] text-nle-text focus:outline-none focus:border-nle-accent placeholder:text-nle-muted"
          />
        </div>

        <div className="flex items-center bg-nle-surface rounded border border-nle-border p-0.5">
          {(['all', 'video', 'audio'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded text-3xs font-medium uppercase transition-colors ${
                filterType === t ? 'bg-nle-panel text-nle-accent font-semibold' : 'text-nle-dim hover:text-nle-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Display */}
      <div className="flex-1 overflow-y-auto p-2">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => {
              const currentScrub = hoverScrubMap[asset.id] || 0;
              return (
                <div
                  key={asset.id}
                  onDoubleClick={() => handleInsertClip(asset)}
                  className="group relative bg-nle-panel border border-nle-border rounded overflow-hidden hover:border-nle-accent/60 transition-all cursor-pointer flex flex-col"
                >
                  {/* Thumbnail / Scrub Container */}
                  <div
                    className="relative aspect-video bg-black/40 overflow-hidden flex items-center justify-center"
                    onMouseMove={(e) => handleHoverScrub(e, asset.id, asset.duration)}
                    onMouseLeave={() => setHoverScrubMap((prev) => ({ ...prev, [asset.id]: 0 }))}
                  >
                    {asset.thumbnail ? (
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-nle-dim">
                        <span className="material-symbols-outlined text-[28px] text-nle-amber">
                          graphic_eq
                        </span>
                        <span className="text-[10px] font-mono mt-1">Waveform Stem</span>
                      </div>
                    )}

                    {/* Hover Scrub Indicator */}
                    {hoverScrubMap[asset.id] !== undefined && hoverScrubMap[asset.id] > 0 && (
                      <div className="absolute inset-0 bg-black/30 pointer-events-none flex flex-col justify-end p-1">
                        <div className="h-1 bg-nle-accent rounded-full mb-1" style={{ width: `${(currentScrub / asset.duration) * 100}%` }} />
                        <span className="text-3xs font-mono text-white bg-black/80 px-1 rounded self-start">
                          {formatDuration(currentScrub)}
                        </span>
                      </div>
                    )}

                    {/* Duration badge */}
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-3xs font-mono text-white">
                      {formatDuration(asset.duration)}
                    </span>

                    {/* Proxy Badge */}
                    <span
                      className={`absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-mono uppercase tracking-wider ${
                        asset.proxyStatus === 'ready'
                          ? 'bg-nle-emerald/80 text-white'
                          : asset.proxyStatus === 'generating'
                          ? 'bg-nle-amber/80 text-black animate-pulse'
                          : 'bg-nle-muted/80 text-white'
                      }`}
                    >
                      {asset.proxyStatus === 'ready' ? 'Proxy' : asset.proxyStatus === 'generating' ? 'Gen...' : 'Raw'}
                    </span>
                  </div>

                  {/* Info Footer */}
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-nle-text truncate" title={asset.name}>
                      {asset.name}
                    </span>
                    <div className="flex items-center justify-between text-3xs text-nle-dim font-mono">
                      <span>{asset.resolution}</span>
                      <span>{asset.fps > 0 ? `${asset.fps}fps` : asset.channels}</span>
                    </div>

                    {/* AI Badges */}
                    {asset.aiBadges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {asset.aiBadges.map((badge, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[8px] px-1 py-0.2 rounded bg-nle-accent/15 border border-nle-accent/30 text-nle-accent"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View with Full Metadata */
          <div className="border border-nle-border rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-3xs font-mono">
              <thead>
                <tr className="bg-nle-header border-b border-nle-border text-nle-dim uppercase tracking-wider">
                  <th className="p-1.5">Clip Name</th>
                  <th className="p-1.5">Type</th>
                  <th className="p-1.5">Duration</th>
                  <th className="p-1.5">Codec</th>
                  <th className="p-1.5">Resolution</th>
                  <th className="p-1.5">Proxy</th>
                  <th className="p-1.5">AI Analysis</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onDoubleClick={() => handleInsertClip(asset)}
                    className="border-b border-nle-border hover:bg-nle-panel cursor-pointer transition-colors"
                  >
                    <td className="p-1.5 font-sans font-semibold text-nle-text flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-nle-accent">
                        {asset.type === 'video' ? 'movie' : 'audiotrack'}
                      </span>
                      <span className="truncate max-w-[140px]">{asset.name}</span>
                    </td>
                    <td className="p-1.5 text-nle-dim uppercase">{asset.type}</td>
                    <td className="p-1.5 text-nle-text">{formatDuration(asset.duration)}</td>
                    <td className="p-1.5 text-nle-dim truncate max-w-[90px]">{asset.codec}</td>
                    <td className="p-1.5 text-nle-text">{asset.resolution}</td>
                    <td className="p-1.5">
                      <span
                        className={`px-1 py-0.2 rounded text-[8px] ${
                          asset.proxyStatus === 'ready'
                            ? 'text-nle-emerald bg-nle-emerald/10'
                            : 'text-nle-amber bg-nle-amber/10'
                        }`}
                      >
                        {asset.proxyStatus}
                      </span>
                    </td>
                    <td className="p-1.5 text-nle-accent">{asset.aiBadges.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
