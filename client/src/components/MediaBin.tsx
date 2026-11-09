import React, { useState, useRef } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { MediaAsset } from '../types';
import { formatDuration } from '../utils/timecode';

export const MediaBin: React.FC = () => {
  const {
    mediaAssets,
    insertAssetAtPlayhead,
    showToastBanner,
    projectName,
    addMediaAsset,
    removeMediaAsset,
    clearMediaAssets,
    setSourceAssetId,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'project' | 'browser'>('project');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [hoverScrubMap, setHoverScrubMap] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredAssets = mediaAssets.filter((asset) => {
    return asset.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleHoverScrub = (e: React.MouseEvent<HTMLDivElement>, assetId: string, duration: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverScrubMap((prev) => ({ ...prev, [assetId]: ratio * duration }));
  };

  const handleInsertClip = (asset: MediaAsset) => {
    setSourceAssetId(asset.id);
    insertAssetAtPlayhead(asset.id);
    showToastBanner(`Added "${asset.name}" to sequence`);
  };

  // Open native local storage file picker
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process files selected from Local Storage / Drag & Drop
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|aac|m4a|flac|ogg)$/i.test(file.name);
      const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file.name);

      const url = URL.createObjectURL(file);
      let duration = 15;
      let resolution = '1920×1080';
      let fps = 30;
      let thumbnail = '';

      if (isVideo) {
        try {
          const vid = document.createElement('video');
          vid.preload = 'metadata';
          vid.src = url;
          await new Promise((res) => {
            vid.onloadedmetadata = () => res(true);
            vid.onerror = () => res(false);
            setTimeout(res, 1000);
          });
          duration = vid.duration || 15;
          if (vid.videoWidth && vid.videoHeight) {
            resolution = `${vid.videoWidth}×${vid.videoHeight}`;
          }
          vid.currentTime = Math.min(1, duration / 3);
          await new Promise((res) => {
            vid.onseeked = () => res(true);
            setTimeout(res, 800);
          });
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(320, vid.videoWidth || 320);
          canvas.height = Math.min(180, vid.videoHeight || 180);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          }
        } catch (e) {
          console.warn('Video metadata parsing fallback', e);
        }
      } else if (isAudio) {
        try {
          const aud = document.createElement('audio');
          aud.src = url;
          await new Promise((res) => {
            aud.onloadedmetadata = () => res(true);
            setTimeout(res, 600);
          });
          duration = aud.duration || 30;
          resolution = 'Audio Master';
        } catch {
          duration = 30;
        }
      } else if (isImage) {
        duration = 5;
        thumbnail = url;
      }

      const newAsset: MediaAsset = {
        id: `local-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        duration,
        resolution,
        fps,
        codec: file.type || 'Local Media File',
        channels: isAudio ? 'Stereo' : 'Video Track',
        proxyStatus: 'ready',
        aiBadges: ['Local File'],
        url,
        thumbnail,
      };

      addMediaAsset(newAsset);
    }

    showToastBanner(`Imported ${files.length} file(s) from local storage`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full bg-[#1e1e1e] border-r border-[#303030] text-xs select-none overflow-hidden transition-colors ${
        isDragging ? 'bg-[#142840] border-[#1473e6]' : ''
      }`}
    >
      {/* Hidden Native File Input for Local Storage Import */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

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
            <span>Project: {projectName.replace('.prproj', '').replace('.cfs', '')}</span>
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

        {/* Clear All / Trash icon if assets exist */}
        {mediaAssets.length > 0 && (
          <button
            onClick={clearMediaAssets}
            className="text-[#888888] hover:text-[#e81123] text-[11px] px-1 transition-colors"
            title="Clear all assets from Project Bin"
          >
            Clear Bin
          </button>
        )}
      </div>

      {/* Subheader: Breadcrumb (📁 Untitled.prproj) */}
      <div className="px-3 py-1 bg-[#222222] border-b border-[#2d2d2d] flex items-center justify-between text-[11px] text-[#a0a0a0]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="material-symbols-outlined text-[14px]">folder</span>
          <span className="text-[#b0b0b0] font-sans truncate">{projectName}</span>
        </div>
        <span className="text-[10px] text-[#777777] font-mono shrink-0">
          {mediaAssets.length} item{mediaAssets.length === 1 ? '' : 's'}
        </span>
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
          title="Import Media from Local Storage (Ctrl+I)"
        >
          <span className="material-symbols-outlined text-[15px]">file_upload</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-center relative">
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
              Drag media here or import from local storage to begin
            </span>
            <button
              onClick={handleImportClick}
              className="px-4 py-1.5 rounded-[3px] bg-[#1473e6] hover:bg-[#005fb8] text-white text-[12px] font-medium transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Import media</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2 h-full content-start">
            {filteredAssets.map((asset) => {
              const scrubTime = hoverScrubMap[asset.id] ?? 0;
              return (
                <div
                  key={asset.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', asset.id);
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onClick={() => handleInsertClip(asset)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setSourceAssetId(asset.id);
                    showToastBanner(`Loaded "${asset.name}" into Source Monitor`);
                  }}
                  onMouseMove={(e) => handleHoverScrub(e, asset.id, asset.duration)}
                  onMouseLeave={() =>
                    setHoverScrubMap((prev) => {
                      const next = { ...prev };
                      delete next[asset.id];
                      return next;
                    })
                  }
                  className="group relative bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] hover:border-[#1473e6] rounded-[3px] overflow-hidden cursor-pointer transition-all flex flex-col"
                  title="Click to insert on timeline • Double-click for Source Monitor • Drag to track"
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
                        {asset.type === 'audio' ? 'audiotrack' : 'movie'}
                      </span>
                    )}

                    {/* Duration badge */}
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-white">
                      {hoverScrubMap[asset.id] !== undefined
                        ? formatDuration(scrubTime)
                        : formatDuration(asset.duration)}
                    </span>

                    {/* Delete hover button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMediaAsset(asset.id);
                      }}
                      className="absolute top-1 right-1 w-4 h-4 rounded bg-black/70 hover:bg-[#e81123] text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-[10px]"
                      title="Remove from project"
                    >
                      ✕
                    </button>
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
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', asset.id);
                  e.dataTransfer.effectAllowed = 'copyMove';
                }}
                onClick={() => handleInsertClip(asset)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSourceAssetId(asset.id);
                  showToastBanner(`Loaded "${asset.name}" into Source Monitor`);
                }}
                className="group flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#2a2a2a] cursor-pointer text-[11px] border-b border-[#2d2d2d]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[15px] text-[#1473e6]">
                    {asset.type === 'audio' ? 'audiotrack' : 'movie'}
                  </span>
                  <span className="text-[#e1e1e1] truncate">{asset.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#888888]">
                    {formatDuration(asset.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMediaAsset(asset.id);
                    }}
                    className="text-[#888888] hover:text-[#e81123] opacity-0 group-hover:opacity-100 px-1"
                    title="Remove from project"
                  >
                    ✕
                  </button>
                </div>
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
            onClick={handleImportClick}
            className="p-1 rounded text-[#888888] hover:text-white"
            title="Import from Local Storage"
          >
            <span className="material-symbols-outlined text-[14px]">folder_open</span>
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
