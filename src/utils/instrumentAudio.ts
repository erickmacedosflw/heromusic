import type { Instrument } from '../state/gameStore';

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
};

const instrumentFrequencies: Record<Instrument, number> = {
  guitar: 329.63,
  drums: 110,
  bass: 98,
  keys: 523.25,
};

export const playInstrumentLayers = (instruments: Instrument[]) => {
  const context = getAudioContext();

  if (!context || instruments.length === 0) {
    return;
  }

  if (context.state === 'suspended') {
    void context.resume();
  }

  const now = context.currentTime;

  instruments.forEach((instrument, index) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = instrument === 'drums' ? 'square' : 'triangle';
    oscillator.frequency.setValueAtTime(instrumentFrequencies[instrument], now);

    const start = now + index * 0.01;
    const duration = instrument === 'drums' ? 0.08 : 0.16;

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  });
};
