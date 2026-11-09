import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const WelcomeModal: React.FC = () => {
  const {
    isWelcomeOpen,
    setWelcomeOpen,
    isNewProjectOpen,
    setNewProjectOpen,
    recentProjects,
    createNewProject,
    setProjectName,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'templates'>('home');
  const [newProjName, setNewProjName] = useState('Commercial_Spot_4K_Rev01.cfs');
  const [newProjDir, setNewProjDir] = useState('D:/Projects/ClipFlow/Commercial_2026');
  const [resolution, setResolution] = useState('4K UHD (3840×2160)');
  const [template, setTemplate] = useState('Standard Commercial Project');
  const [colorSpace, setColorSpace] = useState('ACEScg / Rec.709-A');

  if (!isWelcomeOpen && !isNewProjectOpen) return null;

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    createNewProject({
      name: newProjName,
      directory: newProjDir,
      resolution,
      template,
      colorSpace,
      fps: 60,
    });
  };

  const handleOpenRecent = (name: string) => {
    setProjectName(name);
    setWelcomeOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      {/* If New Project Modal is triggered */}
      {isNewProjectOpen ? (
        <div className="w-full max-w-xl bg-nle-panel border border-nle-border rounded-lg shadow-2xl overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-nle-header border-b border-nle-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-nle-accent text-[20px]">create_new_folder</span>
              <span className="font-bold text-white text-[13px]">Create New Project (.cfs Manifest)</span>
            </div>
            <button
              onClick={() => setNewProjectOpen(false)}
              className="text-nle-dim hover:text-white p-1 rounded"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <form onSubmit={handleCreateNew} className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-3xs font-mono uppercase text-nle-dim">Project Name</label>
              <input
                type="text"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="bg-nle-surface border border-nle-border rounded px-3 py-1.5 text-white font-mono text-[12px] focus:outline-none focus:border-nle-accent"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-3xs font-mono uppercase text-nle-dim">Storage Directory</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProjDir}
                  onChange={(e) => setNewProjDir(e.target.value)}
                  className="flex-1 bg-nle-surface border border-nle-border rounded px-3 py-1.5 text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  className="px-3 py-1.5 rounded bg-nle-border hover:bg-nle-muted text-white text-3xs font-mono"
                >
                  Browse...
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1">
                <label className="text-3xs font-mono uppercase text-nle-dim">Default Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="bg-nle-surface border border-nle-border rounded px-2 py-1.5 text-white text-[11px]"
                >
                  <option value="4K UHD (3840×2160)">4K UHD (3840×2160) 16:9</option>
                  <option value="1080p FHD (1920×1080)">1080p FHD (1920×1080) 16:9</option>
                  <option value="9:16 Social (1080×1920)">9:16 Social Vertical (1080×1920)</option>
                  <option value="4K DCI (4096×2160)">4K DCI (4096×2160) Anamorphic</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-3xs font-mono uppercase text-nle-dim">Working Color Space</label>
                <select
                  value={colorSpace}
                  onChange={(e) => setColorSpace(e.target.value)}
                  className="bg-nle-surface border border-nle-border rounded px-2 py-1.5 text-white text-[11px]"
                >
                  <option value="ACEScg / Rec.709-A">ACEScg / Rec.709-A (Broadcast Standard)</option>
                  <option value="Rec.709 Display">Rec.709 Display (Web / YouTube)</option>
                  <option value="Apple Log Wide Gamut">Apple Log / Rec.2020</option>
                  <option value="DaVinci Wide Gamut">DaVinci Wide Gamut Intermediate</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-3xs font-mono uppercase text-nle-dim">Project Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="bg-nle-surface border border-nle-border rounded px-2 py-1.5 text-white text-[11px]"
              >
                <option value="None">None (Blank Sequence)</option>
                <option value="Broadcast Template Project">Broadcast Template Project (V1-V3, A1-A8 5.1)</option>
                <option value="Social Media Template Project (9:16)">Social Media Template Project (9:16 Smart Reframe)</option>
                <option value="Standard Commercial Project">Standard Commercial Project (ACEScg 60fps)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-nle-border">
              <button
                type="button"
                onClick={() => setNewProjectOpen(false)}
                className="px-4 py-1.5 rounded bg-nle-surface hover:bg-nle-border text-nle-text font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-nle-accent hover:brightness-110 text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] active:scale-95 transition-all"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Welcome Home Dashboard */
        <div className="w-full max-w-4xl h-[520px] bg-nle-surface border border-nle-border rounded-xl shadow-2xl overflow-hidden flex text-xs">
          {/* Left Dock Navigation */}
          <div className="w-52 bg-nle-header border-r border-nle-border flex flex-col justify-between p-3">
            <div className="flex flex-col gap-3">
              {/* App Brand */}
              <div className="flex items-center gap-2 px-2 py-1">
                <span className="material-symbols-outlined text-nle-accent text-[24px]">movie_filter</span>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-[14px] leading-tight">ClipFlow Studio</span>
                  <span className="text-[10px] font-mono text-nle-dim">v2.1.0 WebGPU Core</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setNewProjectOpen(true)}
                className="w-full py-2 px-3 rounded bg-nle-accent hover:brightness-110 text-black font-bold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.25)] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>New Project</span>
              </button>

              {/* Navigation Tabs */}
              <div className="flex flex-col gap-1 mt-2">
                {[
                  { id: 'home', label: 'Recent Projects', icon: 'history' },
                  { id: 'templates', label: 'Starter Templates', icon: 'dashboard_customize' },
                  { id: 'learn', label: 'Learn & Tutorials', icon: 'school' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-nle-panel text-nle-accent border border-nle-border'
                        : 'text-nle-dim hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Close / Return to Editor Button */}
            <button
              onClick={() => setWelcomeOpen(false)}
              className="py-1.5 px-3 rounded bg-nle-panel hover:bg-nle-border border border-nle-border text-nle-text font-semibold flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Editor</span>
            </button>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col p-5 bg-nle-canvas overflow-y-auto">
            {activeTab === 'home' && (
              <div className="flex flex-col gap-4">
                {/* Feature Spotlight Banner */}
                <div className="p-3.5 rounded-lg bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-nle-accent/30 flex items-center justify-between">
                  <div className="flex flex-col gap-1 max-w-md">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-nle-accent font-bold">
                      What's New in 2.1.0
                    </span>
                    <span className="text-[13px] font-bold text-white">
                      AI Silence Stripping & Diarized Transcript Sync
                    </span>
                    <span className="text-3xs text-nle-dim">
                      Auto-detect dead air, breath pauses, and filler words with instant ripple trimming across all sync-locked tracks.
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-nle-accent text-[40px] opacity-80">
                    auto_awesome
                  </span>
                </div>

                {/* Recent Projects List */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-[12px]">Recent CFS Projects</span>
                    <span className="text-3xs font-mono text-nle-dim">{recentProjects.length} Found</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {recentProjects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => handleOpenRecent(proj.name)}
                        className="p-3 bg-nle-panel hover:bg-nle-surface border border-nle-border hover:border-nle-accent/60 rounded-lg cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-nle-dim group-hover:text-nle-accent text-[22px] transition-colors">
                            movie
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white text-[12px] group-hover:text-nle-accent transition-colors">
                              {proj.name}
                            </span>
                            <span className="text-3xs font-mono text-nle-dim">
                              {proj.directory} • {proj.resolution} • {proj.fps}fps
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-3xs font-mono text-nle-dim">
                          <span>{proj.sizeGb} GB</span>
                          <span className="px-2 py-0.5 rounded bg-nle-surface border border-nle-border text-white group-hover:border-nle-accent">
                            Open Sequence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Standard Commercial Project', res: '4K UHD 60fps', desc: 'Pre-routed V1-V3, Dialogue A1-A2, SFX A3-A7, ACEScg' },
                  { title: 'Social Media 9:16 Vertical', res: '1080×1920 30fps', desc: 'Smart auto-reframe, burn-in subtitle CC1, TikTok/Reels' },
                  { title: 'Broadcast Master Template', res: '4K DCI 24fps', desc: 'ProRes 4444 XQ, 5.1 Surround stem busses, SMPTE timecode' },
                  { title: 'Weekly Podcast Multi-Cam', res: '4K UHD 60fps', desc: 'Host & Co-host sync, speech diarization, voice isolation' },
                ].map((tmpl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setTemplate(tmpl.title);
                      setNewProjectOpen(true);
                    }}
                    className="p-3 bg-nle-panel border border-nle-border hover:border-nle-accent rounded-lg cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-white text-[12px]">{tmpl.title}</span>
                      <span className="text-3xs font-mono text-nle-accent">{tmpl.res}</span>
                      <span className="text-3xs text-nle-dim mt-1">{tmpl.desc}</span>
                    </div>
                    <button className="mt-3 py-1 rounded bg-nle-surface text-3xs font-semibold text-white hover:bg-nle-border">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'learn' && (
              <div className="flex flex-col gap-3">
                <span className="font-semibold text-white text-[12px]">ClipFlow Studio Pro Editing Guide</span>
                <div className="p-3 bg-nle-panel border border-nle-border rounded flex flex-col gap-2">
                  <span className="text-white font-medium">Keyboard Ergonomics (J-K-L)</span>
                  <p className="text-3xs text-nle-dim leading-relaxed">
                    Press <code className="text-nle-accent">L</code> to play forward (press repeatedly for 2x, 4x speed),{' '}
                    <code className="text-nle-accent">K</code> to stop, and <code className="text-nle-accent">J</code> to play reverse.
                    Use <code className="text-nle-accent">C</code> for razor cut, <code className="text-nle-accent">V</code> for selection, and{' '}
                    <code className="text-nle-accent">Space</code> for play/pause.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

