import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { MediaAsset } from '../types';
import { ROYALTY_FREE_PRESETS } from '../utils/audioGenerator';

export const AddAudioModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    closeVoiceModal,
    addMediaAsset,
    insertAssetAtTrackAndTime,
    currentTime,
    showToastBanner,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'record'>('upload');

  // Preview audio state
  const [playingPresetId, setPlayingPresetId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  if (!isVoiceModalOpen) return null;

  // 1. Upload Local Audio File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      let duration = 30;

      try {
        const aud = document.createElement('audio');
        aud.src = url;
        await new Promise((res) => {
          aud.onloadedmetadata = () => res(true);
          aud.onerror = () => res(false);
          setTimeout(res, 800);
        });
        duration = aud.duration || 30;
      } catch {
        duration = 30;
      }

      const newAsset: MediaAsset = {
        id: `audio-${Date.now()}-${i}`,
        name: file.name,
        type: 'audio',
        duration,
        resolution: 'Audio Master',
        fps: 0,
        codec: file.type || 'audio/wav',
        channels: 'Stereo 48kHz',
        proxyStatus: 'ready',
        aiBadges: ['Audio Track', '48kHz Stereo'],
        url,
        thumbnail: '',
      };

      addMediaAsset(newAsset);
      insertAssetAtTrackAndTime(newAsset.id, 'a1', currentTime);
      showToastBanner(`Added audio "${file.name}" to Track A1`);
    }

    closeVoiceModal();
  };

  // 2. Play / Stop Royalty-Free Preset Preview
  const handleTogglePresetPlay = async (preset: (typeof ROYALTY_FREE_PRESETS)[0]) => {
    if (playingPresetId === preset.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPlayingPresetId(null);
      return;
    }

    try {
      showToastBanner(`Loading preview for ${preset.title}...`);
      const audioUrl = await preset.generator();
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio();
      }
      previewAudioRef.current.src = audioUrl;
      previewAudioRef.current.play().catch(() => {});
      setPlayingPresetId(preset.id);
      previewAudioRef.current.onended = () => setPlayingPresetId(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Insert Royalty-Free Preset onto Timeline
  const handleInsertPreset = async (preset: (typeof ROYALTY_FREE_PRESETS)[0]) => {
    showToastBanner(`Generating audio track for ${preset.title}...`);
    const audioUrl = await preset.generator();

    const newAsset: MediaAsset = {
      id: `audio-rf-${Date.now()}`,
      name: `${preset.title}.wav`,
      type: 'audio',
      duration: preset.duration,
      resolution: 'Audio Master',
      fps: 0,
      codec: 'Broadcast WAV 24b',
      channels: 'Stereo 48kHz',
      proxyStatus: 'ready',
      aiBadges: ['Royalty-Free', `${preset.bpm} BPM`],
      url: audioUrl,
      thumbnail: '',
    };

    addMediaAsset(newAsset);
    insertAssetAtTrackAndTime(newAsset.id, 'a1', currentTime);
    showToastBanner(`Added "${preset.title}" to Track A1 at ${currentTime.toFixed(1)}s`);
    closeVoiceModal();
  };

  // 3. Live Microphone Voiceover Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 0.1);
      }, 100);

      showToastBanner('Recording microphone audio...');
    } catch (err) {
      showToastBanner('Microphone permission required to record audio');
      console.warn('Microphone access denied or unavailable', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      showToastBanner('Recording finished! Ready to insert.');
    }
  };

  const saveRecordedAudio = () => {
    if (!recordedAudioUrl) return;

    const newAsset: MediaAsset = {
      id: `voiceover-${Date.now()}`,
      name: `Voiceover_Take_${Date.now().toString().slice(-4)}.webm`,
      type: 'audio',
      duration: Math.max(1, recordingDuration),
      resolution: 'Audio Master',
      fps: 0,
      codec: 'Microphone Audio WebM',
      channels: 'Mono 48kHz',
      proxyStatus: 'ready',
      aiBadges: ['Live Voiceover', 'Microphone'],
      url: recordedAudioUrl,
      thumbnail: '',
    };

    addMediaAsset(newAsset);
    insertAssetAtTrackAndTime(newAsset.id, 'a1', currentTime);
    showToastBanner('Added recorded voiceover to Track A1');
    closeVoiceModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#222222] border border-[#383838] rounded-lg shadow-2xl overflow-hidden flex flex-col text-xs text-[#e1e1e1]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-10 bg-[#282828] border-b border-[#353535]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#1473e6]">
              audiotrack
            </span>
            <span className="font-semibold text-white text-[13px]">
              Add Audio to Sequence
            </span>
          </div>
          <button
            onClick={closeVoiceModal}
            className="w-6 h-6 rounded flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#333333] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center border-b border-[#303030] bg-[#1e1e1e] px-4 gap-4">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'text-[#1473e6] border-b-2 border-[#1473e6]'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">upload_file</span>
            Upload Audio File
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'library'
                ? 'text-[#1473e6] border-b-2 border-[#1473e6]'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">library_music</span>
            Royalty-Free Music Library
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className={`py-2 text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'record'
                ? 'text-[#1473e6] border-b-2 border-[#1473e6]'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">mic</span>
            Record Voiceover
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 flex-1 min-h-[220px]">
          {/* TAB 1: UPLOAD LOCAL AUDIO */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#3a3a3a] hover:border-[#1473e6] rounded-lg transition-colors bg-[#1a1a1a] text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.aac,.m4a,.flac,.ogg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="material-symbols-outlined text-[42px] text-[#1473e6] mb-2">
                audio_file
              </span>
              <span className="font-semibold text-white text-[13px] mb-1">
                Select Audio File from Your Computer
              </span>
              <span className="text-[11px] text-[#888888] max-w-xs mb-4">
                Supports MP3, WAV, AAC, M4A, FLAC, and OGG formats. Automatically places onto Track A1 at current playhead.
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#1473e6] hover:bg-[#005fb8] text-white rounded font-medium text-[12px] flex items-center gap-1.5 shadow-md transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                Browse Audio Files...
              </button>
            </div>
          )}

          {/* TAB 2: ROYALTY-FREE MUSIC PRESETS */}
          {activeTab === 'library' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] text-[#888888]">
                Click Preview to listen, or Add to place directly onto Audio Track A1:
              </span>
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                {ROYALTY_FREE_PRESETS.map((preset) => {
                  const isPlaying = playingPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2.5 bg-[#1a1a1a] border border-[#333333] hover:border-[#1473e6] rounded transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleTogglePresetPlay(preset)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isPlaying
                              ? 'bg-[#1473e6] text-white shadow'
                              : 'bg-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:bg-[#353535]'
                          }`}
                          title={isPlaying ? 'Pause Preview' : 'Play Preview'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isPlaying ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-[11px]">
                            {preset.title}
                          </span>
                          <span className="text-[10px] text-[#888888]">
                            {preset.genre} • {preset.duration}s • {preset.bpm} BPM
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInsertPreset(preset)}
                        className="px-3 py-1 bg-[#282828] hover:bg-[#1473e6] text-white rounded border border-[#383838] hover:border-transparent text-[11px] font-medium transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[13px]">add</span>
                        Add to Timeline
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: RECORD MIC VOICEOVER */}
          {activeTab === 'record' && (
            <div className="flex flex-col items-center justify-center p-6 bg-[#1a1a1a] rounded-lg border border-[#333333] text-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-[#e81123] text-white animate-pulse shadow-lg shadow-red-500/30'
                      : 'bg-[#282828] text-[#888888]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[32px]">
                    {isRecording ? 'mic' : 'mic_none'}
                  </span>
                </div>
                <span className="font-mono text-[16px] font-bold text-white">
                  00:{recordingDuration.toFixed(1).padStart(4, '0')}s
                </span>
                <span className="text-[11px] text-[#888888]">
                  {isRecording
                    ? 'Recording live audio from microphone...'
                    : 'Click Start Recording to record your voice commentary.'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-5 py-2 bg-[#e81123] hover:bg-[#c90f1e] text-white rounded font-medium text-[12px] flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2 bg-[#2a2a2a] hover:bg-[#353535] text-white rounded font-medium text-[12px] flex items-center gap-1.5 border border-[#444444] transition-colors"
                  >
                    <span className="w-2.5 h-2.5 bg-[#e81123] rounded-xs" />
                    Stop Recording
                  </button>
                )}

                {recordedAudioUrl && !isRecording && (
                  <button
                    onClick={saveRecordedAudio}
                    className="px-5 py-2 bg-[#107c41] hover:bg-[#0b5c30] text-white rounded font-medium text-[12px] flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">check</span>
                    Insert into Track A1
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e1e] border-t border-[#303030]">
          <span className="text-[10px] text-[#777777]">
            Audio will be inserted at current playhead: {currentTime.toFixed(2)}s on Track A1
          </span>
          <button
            onClick={closeVoiceModal}
            className="px-3 py-1 bg-[#282828] hover:bg-[#333333] text-white rounded text-[11px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

