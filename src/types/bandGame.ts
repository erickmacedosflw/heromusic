import type { Instrument } from '../state/gameStore';

export type StageData = {
  IDPalco: number;
  Palco: string;
  Desc: string;
  Asset: string;
  asset_horizontal?: string;
  asset_parallax?: string;
  map_badge?: string;
  animated: string;
  Ingresso: number;
  Lotacao: number;
  Hype: number;
  Fama: number;
  Fama_Ganho: number;
  Custo: number;
  Shows: number;
  Musicas_Tocadas: number;
};

export type MusicData = {
  id: string;
  nome: string;
  descricao: string;
  bpm: number;
  compasso: string;
  tom: string;
  stream: string;
  bass: string;
  drums: string;
  keys: string;
  eletricguitar: string;
};

export type MusicianData = {
  ID: number;
  Instrumentista: string;
  Instrumento: number;
  Asset_Face: string;
  Asset_Portrait?: string;
  Asset: string;
  Asset_Char?: string;
  Hype: number;
  Fans: number;
  Apresentacao: number;
  Sexo: string;
  Custo: number;
  Cache: number;
  Nivel: number;
  ID_Instrumento: number;
  Contratado: boolean;
  Historia: string;
};

export type HireFilter = 'all' | Instrument;
export type BandMenuView = 'band' | 'specials' | 'analysis';
export type StagePerformerInstrument = 'drums' | 'guitar' | 'bass' | 'keys';
