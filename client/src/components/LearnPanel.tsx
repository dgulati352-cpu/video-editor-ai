import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const LearnPanel: React.FC = () => {
  const { showToastBanner, loadDemoProject } = useTimelineStore();
  const [activeTab, setActiveTab] = useState<'tutorials' | 'search'>('tutorials');

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#303030] text-xs select-none overflow-hidden">
      {/* Header Tab with ≡ */}
      <div className="flex items-center justify-between px-3 h-7 bg-[#252525] border-b border-[#303030]">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-[11px]">Learn</span>
          <span className="text-[#888888] text-[10px]">≡</span>
        </div>
      </div>

      {/* Subheader: Tutorials | Search | User Profile */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#222222] border-b border-[#2d2d2d] text-[11px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`font-medium transition-colors ${
              activeTab === 'tutorials' ? 'text-white font-semibold' : 'text-[#888888] hover:text-white'
            }`}
          >
            Tutorials
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`font-medium transition-colors ${
              activeTab === 'search' ? 'text-white font-semibold' : 'text-[#888888] hover:text-white'
            }`}
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[7px] font-bold text-white">
            DG
          </div>
          <span className="text-[10px] text-[#888888]">dhairya gulati</span>
        </div>
      </div>

      {/* Tutorial Cards Stream (Matching Screenshot) */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* Section 1: Completely New? Start Here! */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-white tracking-tight">
            Completely New? Start Here!
          </span>

          <div
            onClick={() => loadDemoProject()}
            className="group relative bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] rounded-[4px] overflow-hidden cursor-pointer transition-all shadow-sm"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-black relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                alt="Create your first video"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-2 flex flex-col gap-0.5">
              <span className="font-semibold text-white text-[11px] group-hover:text-[#1473e6] transition-colors">
                Create your first video
              </span>
              <span className="text-[9px] text-[#888888]">
                Export • Get started
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: The Basics */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-white tracking-tight">
            The Basics
          </span>

          <div
            onClick={() => loadDemoProject()}
            className="group relative bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] rounded-[4px] overflow-hidden cursor-pointer transition-all shadow-sm"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-black relative">
              <img
                src="https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80"
                alt="Create a promotional video"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-2 flex flex-col gap-0.5">
              <span className="font-semibold text-white text-[11px] group-hover:text-[#1473e6] transition-colors">
                Create a promotional video
              </span>
              <span className="text-[9px] text-[#888888]">
                Promotional video • Collaboration
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Skills and Projects */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-white tracking-tight">
            Skills and Projects
          </span>

          <div
            onClick={() => loadDemoProject()}
            className="group relative bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] rounded-[4px] overflow-hidden cursor-pointer transition-all shadow-sm"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-black relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                alt="Iceland Cinematic"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute font-bold text-white tracking-widest text-[14px] uppercase drop-shadow-md">
                Iceland
              </span>
            </div>

            <div className="p-2 flex flex-col gap-0.5">
              <span className="font-semibold text-white text-[11px] group-hover:text-[#1473e6] transition-colors">
                Travel Vlog Assembly
              </span>
              <span className="text-[9px] text-[#888888]">
                Color grading • Sound design
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
