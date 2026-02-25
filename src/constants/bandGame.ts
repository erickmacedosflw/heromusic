import { iconAnaliseMenu, iconBaixo, iconBandaMenu, iconBateria, iconEspeciaisMenu, iconGuitarra, iconTeclado, iconTodos } from '../assets/bandGameAssets';
import type { Instrument } from '../state/gameStore';
import type { HireFilter } from '../types/bandGame.ts';

export const instrumentLabels: Record<Instrument, string> = {
  guitar: 'Guitarra',
  drums: 'Bateria',
  bass: 'Baixo',
  keys: 'Teclado',
};

export const INITIAL_BPM = 220;
export const METRONOME_BEAT_MS = 60000 / INITIAL_BPM;
export const METRONOME_HIT_WINDOW_MS = METRONOME_BEAT_MS * 0.28;
export const RHYTHM_PLAY_THRESHOLD = 18;
export const SHOW_FAME_REWARD = 5;
export const FANS_GAIN_BASE_RATE = 0.05;
export const FANS_GAIN_MAX_RATE = 0.3;
export const FANS_GAIN_STEP_RATE = 0.05;
export const FANS_GAIN_STEP_MS = 20000;
export const DEFAULT_MUSIC_BPM = 120;
export const PRE_MUSIC_TAP_GAIN = 6.2;
export const PRE_MUSIC_DECAY = 0.9;
export const POST_MUSIC_DECAY = 1.3;
export const CROWD_DECAY_EVERY_STEPS = 1;
export const TAP_EFFECT_LIFETIME_MS = 140;
export const MAX_TAP_EFFECTS = 12;
export const MUSICIANS_MODAL_CLOSE_MS = 260;
export const MUSICIANS_DETAIL_CLOSE_MS = 220;
export const BAND_MODAL_CLOSE_MS = 240;
export const BAND_CONFIG_CLOSE_MS = 220;
export const MAP_RETURN_FADE_OUT_MS = 520;
export const MAP_RETURN_FADE_IN_MS = 420;
export const AMBIENCE_FADE_IN_MS = 900;
export const AMBIENCE_FADE_OUT_MS = 520;
export const STAGE_STEM_FADE_IN_MS = 700;
export const STAGE_STEM_FADE_OUT_MS = 420;
export const MAP_AMBIENCE_VOLUME = 0.04;
export const STAGE_AMBIENCE_VOLUME = 1.70;

export const instrumentById: Record<number, Instrument> = {
  1: 'guitar',
  2: 'bass',
  3: 'drums',
  4: 'keys',
};

export const instrumentIconById: Record<number, string> = {
  1: iconGuitarra,
  2: iconBaixo,
  3: iconBateria,
  4: iconTeclado,
};

export const instrumentNameById: Record<number, string> = {
  1: 'Guitarra',
  2: 'Baixo',
  3: 'Bateria',
  4: 'Teclado',
};

export const instrumentPlaybackOrder: Instrument[] = ['drums', 'bass', 'guitar', 'keys'];
export const instrumentConfigOrder: Instrument[] = ['guitar', 'bass', 'drums', 'keys'];
export const instrumentIconByInstrument: Record<Instrument, string> = {
  guitar: iconGuitarra,
  drums: iconBateria,
  bass: iconBaixo,
  keys: iconTeclado,
};

export const filterOptions: Array<{ id: HireFilter; label: string; icon: string }> = [
  { id: 'all', label: 'Todos', icon: iconTodos },
  { id: 'guitar', label: 'Guitarra', icon: iconGuitarra },
  { id: 'bass', label: 'Baixo', icon: iconBaixo },
  { id: 'drums', label: 'Bateria', icon: iconBateria },
  { id: 'keys', label: 'Teclado', icon: iconTeclado },
];

export const bandMenuOptions: Array<{ id: 'band' | 'specials' | 'analysis'; label: string; icon: string }> = [
  { id: 'band', label: 'Banda', icon: iconBandaMenu },
  { id: 'specials', label: 'Especiais', icon: iconEspeciaisMenu },
  { id: 'analysis', label: 'Análise', icon: iconAnaliseMenu },
];

export const stageMapPositionById: Record<number, { x: number; y: number }> = {
  1: { x: 94.3, y: 82.27 },
  2: { x: 22.81, y: 48.59 },
  3: { x: 82.42, y: 59.61 },
  4: { x: 46.56, y: 37.89 },
  5: { x: 40.55, y: 52.11 },
  6: { x: 75.08, y: 67.19 },
  7: { x: 50.63, y: 71.88 },
  8: { x: 59.3, y: 25.47 },
  9: { x: 90.63, y: 30.86 },
  10: { x: 49.84, y: 8.28 },
};

export const getRhythmTone = (value: number) => {
  if (value <= 15) {
    return '#e13d35';
  }
  if (value <= 30) {
    return '#ec8a2f';
  }
  if (value <= 50) {
    return '#e7d34b';
  }
  if (value <= 75) {
    return '#94e062';
  }
  return '#39c453';
};

export const getRarity = (level: number) => {
  if (level >= 3) {
    return { label: 'Ouro', className: 'gold' as const };
  }

  if (level === 2) {
    return { label: 'Prata', className: 'silver' as const };
  }

  return { label: 'Bronze', className: 'bronze' as const };
};
