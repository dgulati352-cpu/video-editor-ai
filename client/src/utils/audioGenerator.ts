// Utility to generate royalty-free audio tracks using Web Audio API offline rendering
export interface RoyaltyFreeAudioTrack {
  id: string;
  title: string;
  genre: string;
  duration: number;
  bpm: number;
  description: string;
  createAudioUrl: () => Promise<string>;
}

// Helper to encode AudioBuffer to standard WAV Blob URL
export function audioBufferToWavUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const numSamples = buffer.length * numChannels;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Chunk
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt Subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data Subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channel samples
  let offset = 44;
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Generate Ambient Lo-Fi Chill Track (15s loop)
export async function generateLoFiTrack(): Promise<string> {
  const duration = 15;
  const sampleRate = 44100;
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  // Chords progression: Cmaj7 - Am7 - Dm7 - G7
  const chords = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 392.0],  // Am7
    [146.83, 220.0, 261.63, 349.23], // Dm7
    [196.0, 246.94, 293.66, 392.0],  // G7
  ];

  const chordDur = duration / chords.length;

  chords.forEach((chord, idx) => {
    const startTime = idx * chordDur;
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, startTime);

      // Envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDur - 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + chordDur);
    });
  });

  // Soft rhythmic kick & vinyl snap
  for (let t = 0; t < duration; t += 0.5) {
    const isKick = t % 1.0 === 0;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isKick) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  const rendered = await ctx.startRendering();
  return audioBufferToWavUrl(rendered);
}

// Generate Cyberpunk Synthwave Groove (15s loop)
export async function generateSynthwaveTrack(): Promise<string> {
  const duration = 15;
  const sampleRate = 44100;
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  // Driving 80s bassline 120 BPM
  const bassNotes = [65.41, 65.41, 73.42, 87.31, 65.41, 98.0, 87.31, 73.42]; // C2, D2, F2, G2
  const noteDur = 0.25; // 16th notes
  const totalNotes = Math.floor(duration / noteDur);

  for (let i = 0; i < totalNotes; i++) {
    const t = i * noteDur;
    const note = bassNotes[i % bassNotes.length];

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(note, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(350, t + noteDur);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur - 0.02);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + noteDur);
  }

  // Four on the floor kick drum
  for (let t = 0; t < duration; t += 0.5) {
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();

    kickOsc.frequency.setValueAtTime(140, t);
    kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

    kickGain.gain.setValueAtTime(0.4, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);

    kickOsc.start(t);
    kickOsc.stop(t + 0.25);
  }

  const rendered = await ctx.startRendering();
  return audioBufferToWavUrl(rendered);
}

// Generate Cinematic Acoustic Ambient Pad (15s)
export async function generateCinematicTrack(): Promise<string> {
  const duration = 15;
  const sampleRate = 44100;
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  const droneFreqs = [55.0, 110.0, 164.81, 220.0, 277.18, 329.63]; // A major lush chord

  droneFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();

    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, 0);

    pan.pan.setValueAtTime((idx / droneFreqs.length) * 1.6 - 0.8, 0);

    gain.gain.setValueAtTime(0.001, 0);
    gain.gain.linearRampToValueAtTime(0.07, 3);
    gain.gain.setValueAtTime(0.07, duration - 3);
    gain.gain.linearRampToValueAtTime(0.001, duration);

    osc.connect(pan);
    pan.connect(gain);
    gain.connect(ctx.destination);

    osc.start(0);
    osc.stop(duration);
  });

  const rendered = await ctx.startRendering();
  return audioBufferToWavUrl(rendered);
}

export const ROYALTY_FREE_PRESETS = [
  {
    id: 'rf-lofi',
    title: 'Chill Lo-Fi Coffeehouse Loop',
    genre: 'Lo-Fi / Hip-Hop',
    duration: 15,
    bpm: 80,
    description: 'Warm Rhodes chords and relaxed vintage vinyl groove.',
    generator: generateLoFiTrack,
  },
  {
    id: 'rf-synthwave',
    title: 'Synthwave Cyberpunk Pulse',
    genre: 'Electronic / Retrowave',
    duration: 15,
    bpm: 120,
    description: 'Driving 80s bassline with dynamic analog synth energy.',
    generator: generateSynthwaveTrack,
  },
  {
    id: 'rf-cinematic',
    title: 'Cinematic Ambient Acoustic Bed',
    genre: 'Cinematic / Drone',
    duration: 15,
    bpm: 65,
    description: 'Lush atmospheric pads and deep emotive harmonic resonance.',
    generator: generateCinematicTrack,
  },
];

