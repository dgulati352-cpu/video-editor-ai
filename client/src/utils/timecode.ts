export function secondsToSMPTE(seconds: number, fps: number = 60): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  
  const totalFrames = Math.floor(seconds * fps);
  const frames = totalFrames % fps;
  const totalSeconds = Math.floor(seconds);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  const pad = (n: number, z: number = 2) => String(n).padStart(z, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
}

export function SMPTEToSeconds(timecode: string, fps: number = 60): number {
  const parts = timecode.split(':').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return 0;
  const [h, m, s, f] = parts;
  return h * 3600 + m * 60 + s + f / fps;
}

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(m)}:${pad(s)}`;
}

export const formatTimecode = secondsToSMPTE;
