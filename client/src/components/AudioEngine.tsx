import React, { useEffect, useRef } from 'react';
import { useTimelineStore } from '../state/timelineStore';

export const AudioEngine: React.FC = () => {
  const { isPlaying, currentTime, clips, tracks } = useTimelineStore();
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const audioClips = clips.filter(
      (c) => (c.type === 'audio' || /\.(mp3|wav|aac|m4a|ogg|flac|webm)$/i.test(c.title)) && c.mediaUrl
    );

    // Clean up audio elements for clips that were deleted
    const currentClipIds = new Set(audioClips.map((c) => c.id));
    for (const [id, audio] of audioElementsRef.current.entries()) {
      if (!currentClipIds.has(id)) {
        audio.pause();
        audio.src = '';
        audioElementsRef.current.delete(id);
      }
    }

    let isAnyAudioPlaying = false;

    audioClips.forEach((clip) => {
      let audio = audioElementsRef.current.get(clip.id);
      if (!audio) {
        audio = new Audio(clip.mediaUrl);
        audio.preload = 'auto';
        audioElementsRef.current.set(clip.id, audio);
      } else if (audio.src !== clip.mediaUrl && clip.mediaUrl) {
        audio.src = clip.mediaUrl;
      }

      // Check track volume & mute state
      const track = tracks.find((t) => t.id === clip.trackId);
      const isMuted = track ? track.isMuted : false;
      const trackVolDb = track ? track.volumeDb : 0;
      const clipVolDb = clip.volumeDb ?? 0;

      // Convert dB to linear 0..1 scale
      const totalDb = trackVolDb + clipVolDb;
      const linearVol = isMuted ? 0 : Math.max(0, Math.min(1, Math.pow(10, totalDb / 20)));
      audio.volume = linearVol;

      const clipStart = clip.startTime;
      const clipEnd = clip.startTime + clip.duration;
      const isWithinClip = currentTime >= clipStart && currentTime < clipEnd;

      if (isPlaying && isWithinClip) {
        isAnyAudioPlaying = true;
        const localTime = Math.max(0, (currentTime - clipStart) * (clip.speed || 1));
        if (Math.abs(audio.currentTime - localTime) > 0.25) {
          audio.currentTime = localTime;
        }
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      } else {
        if (!audio.paused) {
          audio.pause();
        }
      }
    });

    // Animate audio meter peaks dynamically when playing
    if (isPlaying && isAnyAudioPlaying) {
      const peakL = -14 + (Math.random() * 8 - 4);
      const peakR = -15 + (Math.random() * 8 - 4);
      useTimelineStore.setState({ audioPeakL: peakL, audioPeakR: peakR });
    } else {
      useTimelineStore.setState({ audioPeakL: -60, audioPeakR: -60 });
    }
  }, [isPlaying, currentTime, clips, tracks]);

  // Pause all on unmount
  useEffect(() => {
    return () => {
      audioElementsRef.current.forEach((a) => {
        a.pause();
        a.src = '';
      });
      audioElementsRef.current.clear();
    };
  }, []);

  return null;
};
