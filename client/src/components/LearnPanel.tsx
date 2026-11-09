import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const LearnPanel: React.FC = () => {
  const { showToastBanner, startSilenceAnalysis, quickAutoColorMatch } = useTimelineStore();
  const [activeTab, setActiveTab] = useState<'tutorials' | 'search'>('tutorials');

  return (
    <div className="flex flex-col h-full bg-[#131313] border-r border-nle-border text-xs select-none overflow-hidden">
      {/* Header Tab with ≡ */}
      <div className="flex items-center justify-between px-3 h-8 bg-nle-header border-b border-nle-border">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-nle-text text-[11px]">Learn</span>
          <span className="text-nle-dim text-[11px] font-mono leading-none">≡</span>
        </div>
      </div>

      {/* Subheader: Tutorials | Search | User Profile */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#18181b] border-b border-nle-border text-[11px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`font-medium transition-colors ${
              activeTab === 'tutorials' ? 'text-white font-semibold' : 'text-nle-dim hover:text-white'
            }`}
          >
            Tutorials
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`font-medium transition-colors ${
              activeTab === 'search' ? 'text-white font-semibold' : 'text-nle-dim hover:text-white'
            }`}
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
            DG
          </div>
          <span className="text-3xs text-nle-dim font-mono">dhairya gulati</span>
        </div>
      </div>

      {/* Tutorial Cards Stream (Matching Screenshot) */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* Section 1: Completely New? Start Here! */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-white tracking-tight">
            Completely New? Start Here!
          </span>

          <div
            onClick={() => showToastBanner('Opening Tutorial: Create your first video')}
            className="group relative bg-[#1c1c1f] hover:bg-[#222226] border border-nle-border rounded-lg overflow-hidden cursor-pointer transition-all shadow-md"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-black/60 relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                alt="Create your first video"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 flex flex-col gap-0.5">
              <span className="font-semibold text-white text-[11px] group-hover:text-nle-accent transition-colors">
                Create your first video
              </span>
              <span className="text-3xs text-nle-dim font-mono">
                Export • Get started • 3 min
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: The Basics */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-white tracking-tight">
            The Basics
          </span>

          <div
            onClick={() => startSilenceAnalysis()}
            className="group relative bg-[#1c1c1f] hover:bg-[#222226] border border-nle-border rounded-lg overflow-hidden cursor-pointer transition-all shadow-md"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-black/60 relative">
              <img
                src="https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80"
                alt="Create a promotional video"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 flex flex-col gap-0.5">
              <span className="font-semibold text-white text-[11px] group-hover:text-nle-accent transition-colors">
                Create a promotional video
              </span>
              <span className="text-3xs text-nle-dim font-mono">
                Promotional video • Collaboration
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Skills and Projects */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-white tracking-tight">
            Skills and Projects
          </span>

          <div
            onClick={() => quickAutoColorMatch()}
            className="group relative bg-[#1c1c1f] hover:bg-[#222226] border border-nle-border rounded-lg overflow-hidden cursor-pointer transition-all shadow-md"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-black/60 relative">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                alt="Cinematic Color Grading & Titles"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 flex flex-col gap-0.5">
              <span className="font-semibold text-white text-[11px] group-hover:text-nle-accent transition-colors">
                Cinematic Color & ICELAND Titles
              </span>
              <span className="text-3xs text-nle-dim font-mono">
                Color Grading • MOGRT Graphics
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
