import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';
import { useGameStore, type Instrument } from '../state/gameStore';
import BandConfigModal from './band/BandConfigModal';
import BandManagementScreen from './band/BandManagementScreen';
import MusiciansContractScreen from './musicians/MusiciansContractScreen';
import StageTopValuesBar from './stage/StageTopValuesBar';
import StageBottomNav from './stage/StageBottomNav';
import StageProgressList from './stage/StageProgressList';
import StageCenterPanel from './stage/StageCenterPanel';
import StageCurrentSongBar from './stage/StageCurrentSongBar';
import StageVisualEffectsLayer from './stage/StageVisualEffectsLayer';
import Stage3DScene from './stage/Stage3DScene';
import StageMapModal from './stage/StageMapModal';
import useBandScreensState from '../hooks/useBandScreensState';
import palcosData from '../locals/palcos.json';
import musicsData from '../locals/musics.json';
import musicosData from '../locals/musicos.json';
import { playUiClickSound } from '../utils/clickAudio';
import { pauseThemeMusic, playThemeMusic } from '../utils/themeAudio';

const instrumentLabels: Record<Instrument, string> = {
  guitar: 'Guitarra',
  drums: 'Bateria',
  bass: 'Baixo',
  keys: 'Teclado',
};

const defaultStageBackground = new URL('../rsc/images/palcos/palco_garagem.png', import.meta.url).href;
const defaultStageFloorTexture = new URL('../rsc/images/textura/3343397-madeira-textura-fundo-vetor.jpg', import.meta.url).href;
const iconCache = new URL('../rsc/images/icons/cache_borda_brnca.png', import.meta.url).href;
const iconCost = new URL('../rsc/images/icons/Custo_borda_branca.png', import.meta.url).href;
const iconMoneyWhite = new URL('../rsc/images/icons/Dinheiro_Borda_branca.png', import.meta.url).href;
const iconMoneyBlack = new URL('../rsc/images/icons/Dinheiro_borda_preta.png', import.meta.url).href;
const iconFameWhite = new URL('../rsc/images/icons/fama_borda_branca.png', import.meta.url).href;
const iconFameBlack = new URL('../rsc/images/icons/Fama_borda_preta.png', import.meta.url).href;
const iconFansWhite = new URL('../rsc/images/icons/Fans_borda_branca.png', import.meta.url).href;
const iconFansBlack = new URL('../rsc/images/icons/Fans_Borda_Preta.png', import.meta.url).href;
const iconIngresso = new URL('../rsc/images/icons/Ingrresso.png', import.meta.url).href;
const iconValorCacheTotal = new URL('../rsc/images/icons/valor_de_cache.png', import.meta.url).href;
const iconMusicWhite = new URL('../rsc/images/icons/musica_branco.png', import.meta.url).href;
const iconRhythmWhite = new URL('../rsc/images/icons/Ritmo_Borda_branca.png', import.meta.url).href;
const navBand = new URL('../rsc/images/icons/banda.jpg', import.meta.url).href;
const navHire = new URL('../rsc/images/icons/contratar.jpg', import.meta.url).href;
const navStore = new URL('../rsc/images/icons/loja.jpg', import.meta.url).href;
const navStage = new URL('../rsc/images/icons/palcos.jpg', import.meta.url).href;
const navSongs = new URL('../rsc/images/icons/musicas.png', import.meta.url).href;
const stageWorldMap = new URL('../rsc/images/maps/Mapa_Mundo.jpeg', import.meta.url).href;
const backgroundAudicao = new URL('../rsc/images/backgrounds/audicao.jpg', import.meta.url).href;
const backgroundBackstage = new URL('../rsc/images/backgrounds/Backstage.jpg', import.meta.url).href;
const portraitContratante = new URL('../rsc/images/facesets/velho_contratante_musicos.png', import.meta.url).href;
const iconTodos = new URL('../rsc/images/icons/Icone_Todos.png', import.meta.url).href;
const iconGuitarra = new URL('../rsc/images/icons/Icone_guitarra.png', import.meta.url).href;
const iconBaixo = new URL('../rsc/images/icons/Icone_Baixo.png', import.meta.url).href;
const iconBateria = new URL('../rsc/images/icons/Icone_Bateria.png', import.meta.url).href;
const iconTeclado = new URL('../rsc/images/icons/Icone_Teclado.png', import.meta.url).href;
const iconBandaMenu = new URL('../rsc/images/icons/Icone_Banda.png', import.meta.url).href;
const iconEspeciaisMenu = new URL('../rsc/images/icons/Icone_Especiais.png', import.meta.url).href;
const iconAnaliseMenu = new URL('../rsc/images/icons/icone_Analise.png', import.meta.url).href;
const iconFechar = new URL('../rsc/images/icons/Icone_fechar.png', import.meta.url).href;
const iconConfig = new URL('../rsc/images/icons/Icone_config_branco.png', import.meta.url).href;
const iconExitBand = new URL('../rsc/images/icons/Icone_Sair.png', import.meta.url).href;
const iconBloqueado = new URL('../rsc/images/icons/Icone_bloquado.png', import.meta.url).href;
const iconDisponivel = new URL('../rsc/images/icons/icone_disponivel.png', import.meta.url).href;
const iconMusicoVazio = new URL('../rsc/images/icons/icone_musico.png', import.meta.url).href;
const iconGuitarraVazia = new URL('../rsc/images/icons/Icone_guitarra_vazia.png', import.meta.url).href;
const iconBaixoVazio = new URL('../rsc/images/icons/Icone_baixo_vazio.png', import.meta.url).href;
const iconBateriaVazio = new URL('../rsc/images/icons/Icone_bateria_vazio.png', import.meta.url).href;
const iconTecladoVazio = new URL('../rsc/images/icons/Icone_teclado_vazio.png', import.meta.url).href;
const iconAudioOn = new URL('../rsc/images/icons/Icone_Audio_Ligado.png', import.meta.url).href;
const sfxMoneyReward = new URL('../rsc/audios/Dinheiro_Entrando_2.mp3', import.meta.url).href;
const sfxCrowdApplause = new URL('../rsc/audios/Aplausos.mp3', import.meta.url).href;
const sfxPurchased = new URL('../rsc/audios/Comprado.mp3', import.meta.url).href;
const sfxStarReward = new URL('../rsc/audios/efeito_estrela.mp3', import.meta.url).href;
const ambienceMapAudio = new URL('../rsc/audios/Ambience_Soud_Mapa.mp3', import.meta.url).href;
const ambienceStageCrowdAudio = new URL('../rsc/audios/Ambiance_Pessoas_palco.mp3', import.meta.url).href;

type StageData = {
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

type MusicData = {
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

type MusicianData = {
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

type HireFilter = 'all' | Instrument;
type BandMenuView = 'band' | 'specials' | 'analysis';
type StagePerformerInstrument = 'drums' | 'guitar' | 'bass' | 'keys';

const stages = palcosData.palcos as StageData[];
const stageImageAssetMap = import.meta.glob('../rsc/images/palcos/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const stageMapBadgeAssetMap = import.meta.glob('../rsc/images/maps/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const stageVideoAssetMap = import.meta.glob('../rsc/videos/palcos/*.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const musicStreamAssetMap = import.meta.glob('../rsc/musics/**/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const musicianFaceAssetMap = import.meta.glob('../rsc/images/facesets/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const musicianPortraitAssetMap = import.meta.glob('../rsc/images/portraits/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const resolveStageAsset = (assetPath: string) => {
  if (!assetPath || !assetPath.startsWith('src/')) {
    return defaultStageBackground;
  }

  const viteAssetPath = `../${assetPath.replace(/^src\//, '')}`;
  return stageImageAssetMap[viteAssetPath] ?? defaultStageBackground;
};

const resolveStageAnimatedAsset = (animatedPath: string) => {
  if (!animatedPath || !animatedPath.startsWith('src/')) {
    return null;
  }

  const viteAssetPath = `../${animatedPath.replace(/^src\//, '')}`;
  return stageVideoAssetMap[viteAssetPath] ?? null;
};

const resolveStageMapBadgeAsset = (badgePath: string) => {
  if (!badgePath || !badgePath.startsWith('src/')) {
    return navStage;
  }

  const viteAssetPath = `../${badgePath.replace(/^src\//, '')}`;
  return stageMapBadgeAssetMap[viteAssetPath] ?? navStage;
};

const stageMapPositionById: Record<number, { x: number; y: number }> = {
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

const resolveMusicStreamAsset = (streamPath: string) => {
  if (!streamPath || !streamPath.startsWith('src/')) {
    return null;
  }

  const viteAssetPath = `../${streamPath.replace(/^src\//, '')}`;
  return musicStreamAssetMap[viteAssetPath] ?? null;
};

const resolveMusicianFaceAsset = (faceAsset: string) => {
  if (!faceAsset) {
    return null;
  }

  if (faceAsset.startsWith('src/')) {
    const viteAssetPath = `../${faceAsset.replace(/^src\//, '')}`;
    return musicianFaceAssetMap[viteAssetPath] ?? null;
  }

  const directFacePath = `../rsc/images/facesets/${faceAsset}`;
  if (musicianFaceAssetMap[directFacePath]) {
    return musicianFaceAssetMap[directFacePath];
  }

  const legacyFaceMatch = faceAsset.match(/^Face_(\d+)$/i);
  if (legacyFaceMatch) {
    const parsedFaceNumber = Number.parseInt(legacyFaceMatch[1], 10);
    if (Number.isFinite(parsedFaceNumber) && parsedFaceNumber > 0) {
      const migratedFacePath = `../rsc/images/facesets/Faceset_${parsedFaceNumber}.png`;
      return musicianFaceAssetMap[migratedFacePath] ?? null;
    }
  }

  return null;
};

const resolveMusicianPortraitAsset = (portraitAsset: string) => {
  if (!portraitAsset) {
    return null;
  }

  if (portraitAsset.startsWith('src/')) {
    const viteAssetPath = `../${portraitAsset.replace(/^src\//, '')}`;
    return musicianPortraitAssetMap[viteAssetPath] ?? null;
  }

  const directPortraitPath = `../rsc/images/portraits/${portraitAsset}`;
  return musicianPortraitAssetMap[directPortraitPath] ?? null;
};

const getHowlCurrentTime = (audio: Howl | null) => {
  if (!audio) {
    return 0;
  }

  const seekValue = audio.seek();
  if (typeof seekValue !== 'number' || !Number.isFinite(seekValue)) {
    return 0;
  }

  return Math.max(0, seekValue);
};

const isAudioActuallyPlaying = (audio: Howl | null) =>
  Boolean(audio && audio.playing() && getHowlCurrentTime(audio) > 0);

type BandGameProps = {
  onBackToMenu: () => void;
};

type RewardParticle = {
  id: number;
  kind: 'fans' | 'money' | 'fame';
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
  duration: number;
};

type RewardFloatText = {
  id: number;
  kind: 'fans' | 'money' | 'fame';
  value: number;
  x: number;
  y: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

const formatPerformancePercent = (value: number) => {
  const normalized = value <= 10 ? value * 10 : value;
  const clamped = Math.max(0, Math.min(100, normalized));
  return `+${Math.round(clamped)}%`;
};

const getRhythmTone = (value: number) => {
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

const INITIAL_BPM = 220;
const METRONOME_BEAT_MS = 60000 / INITIAL_BPM;
const METRONOME_HIT_WINDOW_MS = METRONOME_BEAT_MS * 0.28;
const RHYTHM_PLAY_THRESHOLD = 18;
const SHOW_FAME_REWARD = 5;
const FANS_GAIN_BASE_RATE = 0.05;
const FANS_GAIN_MAX_RATE = 0.3;
const FANS_GAIN_STEP_RATE = 0.05;
const FANS_GAIN_STEP_MS = 20000;
const DEFAULT_MUSIC_BPM = 120;
const PRE_MUSIC_TAP_GAIN = 6.2;
const PRE_MUSIC_DECAY = 0.9;
const POST_MUSIC_DECAY = 1.3;
const CROWD_DECAY_EVERY_STEPS = 1;
const TAP_EFFECT_LIFETIME_MS = 140;
const MAX_TAP_EFFECTS = 12;
const MUSICIANS_MODAL_CLOSE_MS = 260;
const MUSICIANS_DETAIL_CLOSE_MS = 220;
const BAND_MODAL_CLOSE_MS = 240;
const BAND_CONFIG_CLOSE_MS = 220;
const MAP_RETURN_FADE_OUT_MS = 520;
const MAP_RETURN_FADE_IN_MS = 420;
const instrumentById: Record<number, Instrument> = {
  1: 'guitar',
  2: 'bass',
  3: 'drums',
  4: 'keys',
};

const instrumentIconById: Record<number, string> = {
  1: iconGuitarra,
  2: iconBaixo,
  3: iconBateria,
  4: iconTeclado,
};

const instrumentNameById: Record<number, string> = {
  1: 'Guitarra',
  2: 'Baixo',
  3: 'Bateria',
  4: 'Teclado',
};

const instrumentPlaybackOrder: Instrument[] = ['drums', 'bass', 'guitar', 'keys'];
const instrumentConfigOrder: Instrument[] = ['guitar', 'bass', 'drums', 'keys'];
const AMBIENCE_FADE_IN_MS = 900;
const AMBIENCE_FADE_OUT_MS = 520;
const STAGE_STEM_FADE_IN_MS = 700;
const STAGE_STEM_FADE_OUT_MS = 420;
const MAP_AMBIENCE_VOLUME = 0.01;
const STAGE_AMBIENCE_VOLUME = 0.55;
const instrumentIconByInstrument: Record<Instrument, string> = {
  guitar: iconGuitarra,
  drums: iconBateria,
  bass: iconBaixo,
  keys: iconTeclado,
};

const filterOptions: Array<{ id: HireFilter; label: string; icon: string }> = [
  { id: 'all', label: 'Todos', icon: iconTodos },
  { id: 'guitar', label: 'Guitarra', icon: iconGuitarra },
  { id: 'bass', label: 'Baixo', icon: iconBaixo },
  { id: 'drums', label: 'Bateria', icon: iconBateria },
  { id: 'keys', label: 'Teclado', icon: iconTeclado },
];

const BandGame: React.FC<BandGameProps> = ({ onBackToMenu }) => {
  const bands = useGameStore((state) => state.bands);
  const activeBandId = useGameStore((state) => state.activeBandId);
  const currentStageId = useGameStore((state) => state.currentStageId);
  const setCurrentStage = useGameStore((state) => state.setCurrentStage);
  const applyShowRewards = useGameStore((state) => state.applyShowRewards);
  const addFameStars = useGameStore((state) => state.addFameStars);
  const hireMusician = useGameStore((state) => state.hireMusician);
  const setBandMusicianSelection = useGameStore((state) => state.setBandMusicianSelection);
  const showPerformance = useGameStore((state) => state.showPerformance);
  const score = useGameStore((state) => state.score);
  const isMusicEnabled = useGameStore((state) => state.audioSettings.musicEnabled);
  const isSfxEnabled = useGameStore((state) => state.audioSettings.sfxEnabled);
  const instrumentVolumes = useGameStore((state) => state.audioSettings.instrumentVolumes);
  const setMusicEnabled = useGameStore((state) => state.setMusicEnabled);
  const setSfxEnabled = useGameStore((state) => state.setSfxEnabled);
  const setInstrumentVolume = useGameStore((state) => state.setInstrumentVolume);
  const [hireFilter, setHireFilter] = useState<HireFilter>('all');
  const [rhythmMeter, setRhythmMeter] = useState(0);
  const [showCrowd, setShowCrowd] = useState(0);
  const [sessionNetGain, setSessionNetGain] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [fansGainRate, setFansGainRate] = useState(0);
  const [musicStreakMs, setMusicStreakMs] = useState(0);
  const [fansStepFlash, setFansStepFlash] = useState(false);
  const [rhythmBonus, setRhythmBonus] = useState(1);
  const [bonusFlash, setBonusFlash] = useState(false);
  const [metronomeTick, setMetronomeTick] = useState(false);
  const [beatHitFeedback, setBeatHitFeedback] = useState(false);
  const [songDurationSec, setSongDurationSec] = useState(0);
  const [songCurrentSec, setSongCurrentSec] = useState(0);
  const lastPulseAtRef = useRef<number | null>(null);
  const metronomeStartAtRef = useRef(Date.now());
  const garageAudioRef = useRef<Howl | null>(null);
  const stageStemAudiosRef = useRef<Partial<Record<Instrument, Howl>>>({});
  const stagePlaybackSecRef = useRef(0);
  const stageStemFadeTimeoutsRef = useRef<Partial<Record<Instrument, number>>>({});
  const isMusicPlayingRef = useRef(false);
  const rhythmStreakRef = useRef(0);
  const rhythmBonusRef = useRef(1);
  const bonusFlashTimeoutRef = useRef<number | null>(null);
  const metronomeFlashTimeoutRef = useRef<number | null>(null);
  const metronomeAnimationFrameRef = useRef<number | null>(null);
  const metronomeBeatIndexRef = useRef(-1);
  const beatHitTimeoutRef = useRef<number | null>(null);
  const loopTransitionTimeoutRef = useRef<number | null>(null);
  const stagePlayPendingRef = useRef(false);
  const rhythmMeterRef = useRef(0);
  const hasActiveMusiciansRef = useRef(false);
  const isMusicEnabledRef = useRef(true);
  const stageVideoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const topFansRef = useRef<HTMLDivElement | null>(null);
  const topMoneyRef = useRef<HTMLDivElement | null>(null);
  const topFameRef = useRef<HTMLDivElement | null>(null);
  const fameTrackRef = useRef<HTMLDivElement | null>(null);
  const crowdTrackRef = useRef<HTMLDivElement | null>(null);
  const gainMeterRef = useRef<HTMLDivElement | null>(null);
  const centerPanelRef = useRef<HTMLDivElement | null>(null);
  const currentSongBarRef = useRef<HTMLDivElement | null>(null);
  const fansGainTrackRef = useRef<HTMLDivElement | null>(null);
  const tapEffectIdRef = useRef(0);
  const rewardAnimationIdRef = useRef(0);
  const soldOutHandledRef = useRef(false);
  const fameProgressRef = useRef(0);
  const crowdDecayStepRef = useRef(0);
  const crowdDecayAmountRef = useRef(0);
  const fansStepIndexRef = useRef(0);
  const fansStepFlashTimeoutRef = useRef<number | null>(null);
  const mapReturnTransitionTimeoutRef = useRef<number | null>(null);
  const [tapEffects, setTapEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [rewardParticles, setRewardParticles] = useState<RewardParticle[]>([]);
  const [rewardTexts, setRewardTexts] = useState<RewardFloatText[]>([]);
  const [isLoopTransitioning, setIsLoopTransitioning] = useState(false);
  const [isStageShowActive, setIsStageShowActive] = useState(false);
  const [isSideMenuHiding, setIsSideMenuHiding] = useState(false);
  const [mapReturnTransitionPhase, setMapReturnTransitionPhase] = useState<'idle' | 'to-black' | 'from-black'>('idle');
  const [bandMenuView, setBandMenuView] = useState<BandMenuView>('band');
  const [fameProgressValue, setFameProgressValue] = useState(0);
  const [famePulseTick, setFamePulseTick] = useState(0);
  const moneyRewardHowlRef = useRef<Howl | null>(null);
  const applauseHowlRef = useRef<Howl | null>(null);
  const purchaseHowlRef = useRef<Howl | null>(null);
  const starRewardHowlRef = useRef<Howl | null>(null);
  const mapAmbienceHowlRef = useRef<Howl | null>(null);
  const stageAmbienceHowlRef = useRef<Howl | null>(null);
  const mapAmbienceFadeTimeoutRef = useRef<number | null>(null);
  const stageAmbienceFadeTimeoutRef = useRef<number | null>(null);
  const {
    activeScreen,
    isClosingMusiciansScreen,
    selectedMusicianDetails,
    isMusicianStoryOpen,
    isClosingMusicianDetails,
    isBandConfigOpen,
    isClosingBandConfig,
    isBandManagementOpen,
    isClosingBandManagement,
    activeBandSelectorInstrument,
    setActiveBandSelectorInstrument,
    openBandConfig,
    closeBandConfig,
    openBandManagementScreen,
    closeBandManagementScreen,
    openMusiciansScreen,
    openMusicianDetails,
    closeMusicianDetails,
    closeMusiciansScreen,
    toggleMusicianStory,
  } = useBandScreensState<MusicianData>({
    musiciansModalCloseMs: MUSICIANS_MODAL_CLOSE_MS,
    musicianDetailsCloseMs: MUSICIANS_DETAIL_CLOSE_MS,
    bandModalCloseMs: BAND_MODAL_CLOSE_MS,
    bandConfigCloseMs: BAND_CONFIG_CLOSE_MS,
    onStoryToggleSound: (isOpening) => {
      playUiClickSound(isOpening ? 'open' : 'close');
    },
  });

  const availableMusics = useMemo(() => musicsData.musicas as MusicData[], []);
  const musicians = useMemo(() => musicosData.musicos as MusicianData[], []);
  const selectedMusic = useMemo(
    () => availableMusics.find((music) => music.id === 'blues_na_garagem') ?? availableMusics[0] ?? null,
    [availableMusics]
  );

  const activeBand = useMemo(
    () => bands.find((band) => band.id === activeBandId) ?? null,
    [bands, activeBandId]
  );

  const activeBandMusicians = useMemo(() => {
    if (!activeBand) {
      return [] as MusicianData[];
    }

    return Object.values(activeBand.musicians)
      .filter((slot) => slot.hired && slot.musicianId !== null)
      .map((slot) => musicians.find((musician) => musician.ID === slot.musicianId))
      .filter((musician): musician is MusicianData => musician !== undefined);
  }, [activeBand, musicians]);

  const bandHypeValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Hype, 0),
    [activeBandMusicians]
  );

  const bandFansValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Fans, 0),
    [activeBandMusicians]
  );

  const bandPerformanceValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Apresentacao, 0),
    [activeBandMusicians]
  );

  const bandCacheValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Cache, 0),
    [activeBandMusicians]
  );
  const hasActiveMusicians = activeBandMusicians.length > 0;

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.IDPalco === currentStageId) ?? stages.find((stage) => stage.IDPalco === 1) ?? stages[0],
    [currentStageId]
  );

  const selectableStages = useMemo(
    () => stages.filter((stage) => stage.Asset.startsWith('src/rsc/images/palcos/')),
    []
  );

  const stageMapEntries = useMemo(
    () => stages.map((stage) => {
      const position = stageMapPositionById[stage.IDPalco] ?? { x: 50, y: 50 };
      return {
        id: stage.IDPalco,
        name: stage.Palco,
        badgeUrl: resolveStageMapBadgeAsset(stage.map_badge ?? ''),
        x: position.x,
        y: position.y,
      };
    }),
    []
  );

  const stageBackground = useMemo(
    () => resolveStageAsset(selectedStage?.Asset ?? ''),
    [selectedStage]
  );
  const stage3DBackground = useMemo(
    () => resolveStageAsset(selectedStage?.asset_parallax ?? selectedStage?.asset_horizontal ?? selectedStage?.Asset ?? ''),
    [selectedStage]
  );
  const selectedStageBadge = useMemo(
    () => resolveStageMapBadgeAsset(selectedStage?.map_badge ?? ''),
    [selectedStage]
  );
  const stageAnimatedBackground = useMemo(
    () => (selectedStage?.asset_parallax || selectedStage?.asset_horizontal
      ? null
      : resolveStageAnimatedAsset(selectedStage?.animated ?? '')),
    [selectedStage]
  );

  const filteredMusicians = useMemo(() => {
    if (hireFilter === 'all') {
      return musicians;
    }

    return musicians.filter((musician) => instrumentById[musician.Instrumento] === hireFilter);
  }, [musicians, hireFilter]);

  const listedMusicians = useMemo(() => {
    return [...filteredMusicians].sort((left, right) => {
      const leftInstrument = instrumentById[left.Instrumento];
      const rightInstrument = instrumentById[right.Instrumento];
      const leftSlot = leftInstrument ? activeBand?.musicians[leftInstrument] : null;
      const rightSlot = rightInstrument ? activeBand?.musicians[rightInstrument] : null;
      const leftHired = Boolean(leftSlot?.hired && leftSlot.musicianId === left.ID);
      const rightHired = Boolean(rightSlot?.hired && rightSlot.musicianId === right.ID);

      if (leftHired === rightHired) {
        return left.ID - right.ID;
      }

      return leftHired ? -1 : 1;
    });
  }, [filteredMusicians, activeBand]);

  const availableBandCoins = activeBand?.coins ?? 0;
  const selectedMusicianPrice = selectedMusicianDetails?.Custo ?? 0;

  const selectedInstrument = selectedMusicianDetails
    ? instrumentById[selectedMusicianDetails.Instrumento]
    : null;

  const selectedInstrumentSlot = selectedInstrument
    ? activeBand?.musicians[selectedInstrument]
    : null;

  const unlockedMusicianIdSet = useMemo(() => {
    if (!activeBand) {
      return new Set<number>();
    }

    const persistedIds = activeBand.unlockedMusicianIds ?? [];
    const equippedIds = Object.values(activeBand.musicians)
      .map((slot) => slot.musicianId)
      .filter((id): id is number => id !== null);

    return new Set<number>([...persistedIds, ...equippedIds]);
  }, [activeBand]);

  const isSelectedMusicianHired = Boolean(
    selectedMusicianDetails
      && unlockedMusicianIdSet.has(selectedMusicianDetails.ID)
  );

  const hasEnoughCoinsForSelected = selectedMusicianPrice > 0 && availableBandCoins >= selectedMusicianPrice;

  const canHireSelectedMusician = Boolean(
    selectedInstrument
      && activeBand
      && !isSelectedMusicianHired
      && hasEnoughCoinsForSelected
  );

  const isSelectedMusicianLockedByCoins = !isSelectedMusicianHired && !hasEnoughCoinsForSelected;

  const getRarity = (level: number) => {
    if (level >= 3) {
      return { label: 'Ouro', className: 'gold' as const };
    }

    if (level === 2) {
      return { label: 'Prata', className: 'silver' as const };
    }

    return { label: 'Bronze', className: 'bronze' as const };
  };

  const selectedMusicianRarityClass = selectedMusicianDetails
    ? getRarity(selectedMusicianDetails.Nivel).className
    : null;
  const selectedMusicianFace = selectedMusicianDetails
    ? resolveMusicianFaceAsset(selectedMusicianDetails.Asset_Face)
    : null;
  const selectedMusicianPortrait = selectedMusicianDetails
    ? resolveMusicianPortraitAsset(selectedMusicianDetails.Asset_Portrait ?? '')
    : null;
  const selectedMusicianInitials = selectedMusicianDetails
    ? selectedMusicianDetails.Instrumentista
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
    : '';
  const selectedMusicianInstrumentIcon = selectedMusicianDetails
    ? instrumentIconById[selectedMusicianDetails.Instrumento] ?? iconTodos
    : iconTodos;

  const listedMusicianItems = useMemo(() => {
    return listedMusicians.map((musician) => {
      const rarity = getRarity(musician.Nivel);
      const instrument = instrumentById[musician.Instrumento];
      const isMusicianHired = unlockedMusicianIdSet.has(musician.ID);
      const isLockedByCoins = !isMusicianHired && availableBandCoins < musician.Custo;
      const instrumentIcon = instrumentIconById[musician.Instrumento] ?? iconTodos;
      const initials = musician.Instrumentista
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

      return {
        musician,
        rarityClass: rarity.className,
        rarityLabel: rarity.label,
        instrumentIcon,
        isMusicianHired,
        isLockedByCoins,
        musicianFaceSrc: resolveMusicianFaceAsset(musician.Asset_Face),
        initials,
      };
    });
  }, [listedMusicians, availableBandCoins, unlockedMusicianIdSet]);

  const availableToHireCount = useMemo(() => {
    return musicians.filter((musician) => {
      if (unlockedMusicianIdSet.has(musician.ID)) {
        return false;
      }

      return availableBandCoins >= musician.Custo;
    }).length;
  }, [musicians, unlockedMusicianIdSet, availableBandCoins]);

  const isMusiciansScreenVisible = activeScreen === 'musicians' || isClosingMusiciansScreen;
  const isBandManagementScreenVisible = isBandManagementOpen || isClosingBandManagement;
  const isBandConfigVisible = isBandConfigOpen || isClosingBandConfig;

  const selectedMusicStems = useMemo(() => {
    return {
      guitar: resolveMusicStreamAsset(selectedMusic?.eletricguitar ?? ''),
      bass: resolveMusicStreamAsset(selectedMusic?.bass ?? ''),
      drums: resolveMusicStreamAsset(selectedMusic?.drums ?? ''),
      keys: resolveMusicStreamAsset(selectedMusic?.keys ?? ''),
    } as Record<Instrument, string | null>;
  }, [selectedMusic]);

  const activeBandInstruments = useMemo(() => {
    if (!activeBand) {
      return [] as Instrument[];
    }

    return instrumentPlaybackOrder.filter((instrument) => {
      const slot = activeBand.musicians[instrument];
      return slot.hired && slot.musicianId !== null;
    });
  }, [
    activeBand?.musicians.guitar.hired,
    activeBand?.musicians.guitar.musicianId,
    activeBand?.musicians.bass.hired,
    activeBand?.musicians.bass.musicianId,
    activeBand?.musicians.drums.hired,
    activeBand?.musicians.drums.musicianId,
    activeBand?.musicians.keys.hired,
    activeBand?.musicians.keys.musicianId,
  ]);

  const activeBandInstrumentsKey = activeBandInstruments.join('|');
  const instrumentVolumeControls = useMemo(() => {
    return instrumentConfigOrder.map((instrument) => ({
      instrument,
      label: instrumentLabels[instrument],
      icon: instrumentIconByInstrument[instrument],
      value: instrumentVolumes[instrument] ?? 1,
    }));
  }, [instrumentVolumes]);

  useEffect(() => {
    const shouldPlayMapTheme = isMusicEnabled && !isStageShowActive && mapReturnTransitionPhase !== 'to-black';

    if (!shouldPlayMapTheme) {
      pauseThemeMusic();
      return;
    }

    playThemeMusic();
  }, [isMusicEnabled, isStageShowActive, mapReturnTransitionPhase]);

  const getStageAudios = () =>
    Object.values(stageStemAudiosRef.current).filter((audio): audio is Howl => Boolean(audio));

  const clearStageStemFadeTimeout = (instrument: Instrument) => {
    const timeoutId = stageStemFadeTimeoutsRef.current[instrument];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete stageStemFadeTimeoutsRef.current[instrument];
    }
  };

  const pauseStageAudios = () => {
    const stageAudios = getStageAudios();
    if (stageAudios.length === 0) {
      return;
    }

    const primaryAudio = garageAudioRef.current ?? stageAudios[0];
    stagePlaybackSecRef.current = getHowlCurrentTime(primaryAudio);

    instrumentPlaybackOrder.forEach((instrument) => {
      const audio = stageStemAudiosRef.current[instrument];
      if (!audio) {
        return;
      }

      clearStageStemFadeTimeout(instrument);

      if (!audio.playing()) {
        audio.volume(0);
        return;
      }

      const currentVolume = Number(audio.volume()) || 0;
      audio.fade(currentVolume, 0, STAGE_STEM_FADE_OUT_MS);
      stageStemFadeTimeoutsRef.current[instrument] = window.setTimeout(() => {
        if (audio.playing()) {
          audio.pause();
        }
        audio.volume(0);
        delete stageStemFadeTimeoutsRef.current[instrument];
      }, STAGE_STEM_FADE_OUT_MS + 40);
    });
  };

  const clearAmbienceFadeTimeout = (timeoutRef: React.MutableRefObject<number | null>) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const playAmbienceWithFade = (
    ambienceHowl: Howl | null,
    targetVolume: number,
    fadeTimeoutRef: React.MutableRefObject<number | null>
  ) => {
    if (!ambienceHowl) {
      return;
    }

    clearAmbienceFadeTimeout(fadeTimeoutRef);

    if (!ambienceHowl.playing()) {
      ambienceHowl.volume(0);
      ambienceHowl.play();
    }

    const currentVolume = Number(ambienceHowl.volume()) || 0;
    if (currentVolume >= targetVolume) {
      ambienceHowl.volume(targetVolume);
      return;
    }

    ambienceHowl.fade(currentVolume, targetVolume, AMBIENCE_FADE_IN_MS);
  };

  const stopAmbienceWithFade = (
    ambienceHowl: Howl | null,
    fadeTimeoutRef: React.MutableRefObject<number | null>
  ) => {
    if (!ambienceHowl) {
      return;
    }

    clearAmbienceFadeTimeout(fadeTimeoutRef);

    if (!ambienceHowl.playing()) {
      ambienceHowl.stop();
      ambienceHowl.seek(0);
      ambienceHowl.volume(0);
      return;
    }

    const currentVolume = Number(ambienceHowl.volume()) || 0;
    ambienceHowl.fade(currentVolume, 0, AMBIENCE_FADE_OUT_MS);
    fadeTimeoutRef.current = window.setTimeout(() => {
      ambienceHowl.stop();
      ambienceHowl.seek(0);
      ambienceHowl.volume(0);
      fadeTimeoutRef.current = null;
    }, AMBIENCE_FADE_OUT_MS + 60);
  };

  const attemptStageAudioPlay = () => {
    const stageAudios = getStageAudios();
    if (stageAudios.length === 0) {
      return;
    }

    const stageAudio = garageAudioRef.current ?? stageAudios[0];
    garageAudioRef.current = stageAudio;

    if (!hasActiveMusiciansRef.current || !isMusicEnabledRef.current) {
      return;
    }

    if (rhythmMeterRef.current <= RHYTHM_PLAY_THRESHOLD) {
      return;
    }

    const baseTime = Math.max(stagePlaybackSecRef.current, getHowlCurrentTime(stageAudio));

    if (stagePlayPendingRef.current || isMusicPlayingRef.current || stageAudio.playing()) {
      return;
    }

    Howler.autoSuspend = false;
    void Howler.ctx?.resume();

    stagePlayPendingRef.current = true;

    instrumentPlaybackOrder.forEach((instrument) => {
      const audio = stageStemAudiosRef.current[instrument];
      if (!audio) {
        return;
      }

      clearStageStemFadeTimeout(instrument);

      const targetVolume = isMusicEnabledRef.current ? (instrumentVolumes[instrument] ?? 1) : 0;
      const startFromZero = !audio.playing();

      if (startFromZero) {
        audio.seek(baseTime);
        audio.volume(0);
        audio.play();
      }

      const currentVolume = Number(audio.volume()) || 0;
      if (currentVolume === targetVolume) {
        return;
      }

      audio.fade(currentVolume, targetVolume, STAGE_STEM_FADE_IN_MS);
    });
  };

  if (!activeBand) {
    return (
      <section className="game-screen">
        <div className="empty-card">
          <p>Nenhuma banda selecionada.</p>
          <button type="button" className="primary-btn" onClick={onBackToMenu} data-click-sfx="close">
            Voltar ao menu
          </button>
        </div>
      </section>
    );
  }

  const fameTarget = selectedStage?.Hype ?? 5000;
  const lotacaoTarget = selectedStage?.Lotacao ?? 100;
  const fameValue = fameProgressValue;
  const lotacaoValue = showCrowd;
  const fansTapGain = Math.max(0, bandFansValue);
  const hypeTapGain = Math.max(0, bandHypeValue);
  const famePct = Math.min(100, (fameValue / fameTarget) * 100);
  const lotacaoPct = Math.min(100, (lotacaoValue / lotacaoTarget) * 100);
  const bandCostValue = Math.max(0, bandCacheValue);
  const stageTicketPrice = selectedStage?.Ingresso ?? 5;
  const lotacaoTotalValue = lotacaoTarget * stageTicketPrice;
  const gainValue = Math.max(0, lotacaoTotalValue - bandCostValue);
  const fansRewardOnSoldOut = Math.round(lotacaoTarget * fansGainRate);
  const currentSongName = selectedMusic?.nome ?? 'Música Principal';
  const currentSongBpm = Math.max(1, selectedMusic?.bpm ?? DEFAULT_MUSIC_BPM);
  const metronomeBeatMs = 60000 / currentSongBpm;
  const metronomeHitWindowMs = metronomeBeatMs * 0.28;
  const elapsedInCurrentStepMs = musicStreakMs % FANS_GAIN_STEP_MS;
  const stepProgress = elapsedInCurrentStepMs / FANS_GAIN_STEP_MS;
  const nextVisualRate = Math.min(FANS_GAIN_MAX_RATE, fansGainRate + FANS_GAIN_STEP_RATE * stepProgress);
  const fansGainDisplayRate = isMusicPlaying ? nextVisualRate : fansGainRate;
  const fansGainBarPct = (fansGainDisplayRate / FANS_GAIN_MAX_RATE) * 100;
  const songProgressPct = songDurationSec > 0 ? Math.min(100, (songCurrentSec / songDurationSec) * 100) : 0;
  const totalFlow = Math.max(1, gainValue + bandCostValue);
  const costSharePct = (bandCostValue / totalFlow) * 100;
  const gainSharePct = 100 - costSharePct;

  const bandMenuOptions: Array<{ id: BandMenuView; label: string; icon: string }> = [
    { id: 'band', label: 'Banda', icon: iconBandaMenu },
    { id: 'specials', label: 'Especiais', icon: iconEspeciaisMenu },
    { id: 'analysis', label: 'Análise', icon: iconAnaliseMenu },
  ];

  const guitarMusician = musicians.find((item) => item.ID === activeBand.musicians.guitar.musicianId);
  const bassMusician = musicians.find((item) => item.ID === activeBand.musicians.bass.musicianId);
  const drumsMusician = musicians.find((item) => item.ID === activeBand.musicians.drums.musicianId);
  const keysMusician = musicians.find((item) => item.ID === activeBand.musicians.keys.musicianId);

  const stageBandPerformers = [
    {
      instrument: 'drums' as const,
      musician: drumsMusician,
      isHired: activeBand.musicians.drums.hired,
    },
    {
      instrument: 'guitar' as const,
      musician: guitarMusician,
      isHired: activeBand.musicians.guitar.hired,
    },
    {
      instrument: 'bass' as const,
      musician: bassMusician,
      isHired: activeBand.musicians.bass.hired,
    },
    {
      instrument: 'keys' as const,
      musician: keysMusician,
      isHired: activeBand.musicians.keys.hired,
    },
  ]
    .map((entry) => {
      if (!entry.isHired || !entry.musician) {
        return null;
      }

      const portraitSrc = resolveMusicianPortraitAsset(entry.musician.Asset_Portrait ?? '');
      if (!portraitSrc) {
        return null;
      }

      return {
        instrument: entry.instrument,
        id: entry.musician.ID,
        name: entry.musician.Instrumentista,
        portraitSrc,
      };
    })
    .filter((entry): entry is { instrument: Instrument; id: number; name: string; portraitSrc: string } => Boolean(entry));

  const stage3DActiveMusicians = useMemo(
    () => stageBandPerformers.map((performer) => ({
      instrument: performer.instrument as StagePerformerInstrument,
      id: performer.id,
      portraitSrc: performer.portraitSrc,
    })),
    [stageBandPerformers]
  );

  const stage3DActiveMusiciansSignature = useMemo(
    () => stage3DActiveMusicians
      .map((performer) => `${performer.instrument}:${performer.id}:${performer.portraitSrc}`)
      .join('|'),
    [stage3DActiveMusicians]
  );

  const bandInstrumentColumns: Array<{
    id: Instrument;
    label: string;
    icon: string;
    emptyInstrumentIcon: string;
    musicianId: number | null;
    musicianName: string;
    musicianFirstName: string;
    musicianFace: string | null;
    hasMusician: boolean;
    rarityClass: 'bronze' | 'silver' | 'gold' | null;
  }> = [
    {
      id: 'guitar',
      label: 'Guitarra',
      icon: iconGuitarra,
      emptyInstrumentIcon: iconGuitarraVazia,
      musicianId: guitarMusician?.ID ?? null,
      musicianName: guitarMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: guitarMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(guitarMusician?.Asset_Face ?? ''),
      hasMusician: activeBand.musicians.guitar.hired,
      rarityClass: activeBand.musicians.guitar.hired
        ? getRarity(guitarMusician?.Nivel ?? 1).className
        : null,
    },
    {
      id: 'bass',
      label: 'Baixo',
      icon: iconBaixo,
      emptyInstrumentIcon: iconBaixoVazio,
      musicianId: bassMusician?.ID ?? null,
      musicianName: bassMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: bassMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(bassMusician?.Asset_Face ?? ''),
      hasMusician: activeBand.musicians.bass.hired,
      rarityClass: activeBand.musicians.bass.hired
        ? getRarity(bassMusician?.Nivel ?? 1).className
        : null,
    },
    {
      id: 'drums',
      label: 'Bateria',
      icon: iconBateria,
      emptyInstrumentIcon: iconBateriaVazio,
      musicianId: drumsMusician?.ID ?? null,
      musicianName: drumsMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: drumsMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(drumsMusician?.Asset_Face ?? ''),
      hasMusician: activeBand.musicians.drums.hired,
      rarityClass: activeBand.musicians.drums.hired
        ? getRarity(drumsMusician?.Nivel ?? 1).className
        : null,
    },
    {
      id: 'keys',
      label: 'Teclado',
      icon: iconTeclado,
      emptyInstrumentIcon: iconTecladoVazio,
      musicianId: keysMusician?.ID ?? null,
      musicianName: keysMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: keysMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(keysMusician?.Asset_Face ?? ''),
      hasMusician: activeBand.musicians.keys.hired,
      rarityClass: activeBand.musicians.keys.hired
        ? getRarity(keysMusician?.Nivel ?? 1).className
        : null,
    },
  ];

  const selectorMusicians = useMemo(() => {
    if (!activeBandSelectorInstrument) {
      return [] as Array<{
        id: number;
        name: string;
        firstName: string;
        face: string | null;
        portrait: string | null;
        rarityClass: 'bronze' | 'silver' | 'gold';
        rarityLabel: string;
        hype: number;
        fans: number;
        performance: number;
        cache: number;
      }>;
    }

    return musicians
      .filter((musician) => instrumentById[musician.Instrumento] === activeBandSelectorInstrument)
      .filter((musician) => unlockedMusicianIdSet.has(musician.ID))
      .map((musician) => {
        const rarity = getRarity(musician.Nivel);
        return {
          id: musician.ID,
          name: musician.Instrumentista,
          firstName: musician.Instrumentista.split(' ')[0] ?? 'Músico',
          face: resolveMusicianFaceAsset(musician.Asset_Face),
          portrait: resolveMusicianPortraitAsset(musician.Asset_Portrait ?? ''),
          rarityClass: rarity.className,
          rarityLabel: rarity.label,
          hype: musician.Hype,
          fans: musician.Fans,
          performance: musician.Apresentacao,
          cache: musician.Cache,
        };
      });
  }, [activeBandSelectorInstrument, musicians, unlockedMusicianIdSet]);

  const selectedSelectorMusicianId = activeBandSelectorInstrument
    ? activeBand.musicians[activeBandSelectorInstrument].musicianId
    : null;

  useEffect(() => {
    metronomeStartAtRef.current = Date.now();
  }, [metronomeBeatMs]);

  const getCenter = (element: HTMLElement | null) => {
    if (!element || !stageRef.current) {
      return null;
    }

    const stageBounds = stageRef.current.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    return {
      x: bounds.left - stageBounds.left + bounds.width / 2,
      y: bounds.top - stageBounds.top + bounds.height / 2,
    };
  };

  const triggerFameStarRewardAnimation = (starsGained: number) => {
    if (starsGained <= 0) {
      return;
    }

    const fameStart = getCenter(fameTrackRef.current);
    const fameEnd = getCenter(topFameRef.current);

    if (!fameStart || !fameEnd) {
      return;
    }

    for (let index = 0; index < starsGained; index += 1) {
      const id = rewardAnimationIdRef.current + 1;
      rewardAnimationIdRef.current = id;
      const delay = index * 180;

      const fameParticle: RewardParticle = {
        id,
        kind: 'fame',
        x: fameStart.x,
        y: fameStart.y,
        dx: fameEnd.x - fameStart.x,
        dy: fameEnd.y - fameStart.y,
        delay,
        duration: 920,
      };

      setRewardParticles((currentParticles) => [...currentParticles, fameParticle]);
      window.setTimeout(() => {
        setRewardParticles((currentParticles) =>
          currentParticles.filter((particle) => particle.id !== id)
        );
      }, delay + 1200);

      window.setTimeout(() => {
        setFamePulseTick((current) => current + 1);
      }, delay + 900);
    }
  };

  const applyFameGain = (gain: number) => {
    if (gain <= 0 || fameTarget <= 0) {
      return;
    }

    const total = fameProgressRef.current + gain;
    const earnedStars = Math.floor(total / fameTarget);
    const nextProgress = total % fameTarget;

    fameProgressRef.current = nextProgress;
    setFameProgressValue(nextProgress);

    if (earnedStars > 0) {
      addFameStars(earnedStars);
      triggerFameStarRewardAnimation(earnedStars);
      playFameStarSound();
    }
  };

  const triggerSoldOutRewardAnimation = () => {

    const fansStart = getCenter(crowdTrackRef.current);
    const fansEnd = getCenter(topFansRef.current);
    const moneyStart = getCenter(gainMeterRef.current);
    const moneyEnd = getCenter(topMoneyRef.current);

    if (fansStart && fansEnd) {
      const newFansParticles: RewardParticle[] = Array.from({ length: 10 }, (_, index) => {
        const id = rewardAnimationIdRef.current + 1;
        rewardAnimationIdRef.current = id;
        return {
          id,
          kind: 'fans',
          x: fansStart.x + (Math.random() * 12 - 6),
          y: fansStart.y + (Math.random() * 12 - 6),
          dx: fansEnd.x - fansStart.x + (Math.random() * 26 - 13),
          dy: fansEnd.y - fansStart.y + (Math.random() * 18 - 9),
          delay: index * 34,
          duration: 820,
        };
      });
      const idsToClear = newFansParticles.map((particle) => particle.id);
      setRewardParticles((currentParticles) => [...currentParticles, ...newFansParticles]);
      window.setTimeout(() => {
        setRewardParticles((currentParticles) =>
          currentParticles.filter((particle) => !idsToClear.includes(particle.id))
        );
      }, 1480);

      const fansTextId = rewardAnimationIdRef.current + 1;
      rewardAnimationIdRef.current = fansTextId;
      setRewardTexts((currentTexts) => [
        ...currentTexts,
        { id: fansTextId, kind: 'fans', value: fansRewardOnSoldOut, x: fansEnd.x, y: fansEnd.y },
      ]);
      window.setTimeout(() => {
        setRewardTexts((currentTexts) => currentTexts.filter((entry) => entry.id !== fansTextId));
      }, 3200);
    }

    if (moneyStart && moneyEnd) {
      const newMoneyParticles: RewardParticle[] = Array.from({ length: 8 }, (_, index) => {
        const id = rewardAnimationIdRef.current + 1;
        rewardAnimationIdRef.current = id;
        return {
          id,
          kind: 'money',
          x: moneyStart.x + (Math.random() * 12 - 6),
          y: moneyStart.y + (Math.random() * 12 - 6),
          dx: moneyEnd.x - moneyStart.x + (Math.random() * 22 - 11),
          dy: moneyEnd.y - moneyStart.y + (Math.random() * 16 - 8),
          delay: index * 30,
          duration: 860,
        };
      });
      const idsToClear = newMoneyParticles.map((particle) => particle.id);
      setRewardParticles((currentParticles) => [...currentParticles, ...newMoneyParticles]);
      window.setTimeout(() => {
        setRewardParticles((currentParticles) =>
          currentParticles.filter((particle) => !idsToClear.includes(particle.id))
        );
      }, 1520);

      const moneyTextId = rewardAnimationIdRef.current + 1;
      rewardAnimationIdRef.current = moneyTextId;
      setRewardTexts((currentTexts) => [
        ...currentTexts,
        { id: moneyTextId, kind: 'money', value: gainValue, x: moneyEnd.x, y: moneyEnd.y },
      ]);
      window.setTimeout(() => {
        setRewardTexts((currentTexts) => currentTexts.filter((entry) => entry.id !== moneyTextId));
      }, 3400);
    }
  };

  const handleExitStageShow = () => {
    if (mapReturnTransitionPhase !== 'idle') {
      return;
    }

    pauseStageAudios();
    stopAmbienceWithFade(stageAmbienceHowlRef.current, stageAmbienceFadeTimeoutRef);
    stagePlayPendingRef.current = false;
    lastPulseAtRef.current = 0;
    rhythmStreakRef.current = 0;
    rhythmBonusRef.current = 1;
    metronomeBeatIndexRef.current = -1;

    setIsMusicPlaying(false);
    setMetronomeTick(false);
    setBeatHitFeedback(false);
    setRhythmBonus(1);
    setRhythmMeter(0);
    setBonusFlash(false);

    setMapReturnTransitionPhase('to-black');
    if (mapReturnTransitionTimeoutRef.current) {
      window.clearTimeout(mapReturnTransitionTimeoutRef.current);
    }

    mapReturnTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsLoopTransitioning(false);
      setIsStageShowActive(false);
      setIsSideMenuHiding(false);
      setMapReturnTransitionPhase('from-black');

      mapReturnTransitionTimeoutRef.current = window.setTimeout(() => {
        setMapReturnTransitionPhase('idle');
        mapReturnTransitionTimeoutRef.current = null;
      }, MAP_RETURN_FADE_IN_MS);
    }, MAP_RETURN_FADE_OUT_MS);
  };

  const triggerLoopTransition = () => {
    setIsLoopTransitioning(true);
    if (loopTransitionTimeoutRef.current) {
      window.clearTimeout(loopTransitionTimeoutRef.current);
    }
    loopTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsLoopTransitioning(false);
    }, 360);
  };

  const handleStageVideoEnded = () => {
    const stageVideo = stageVideoRef.current;
    if (!stageVideo) {
      return;
    }

    triggerLoopTransition();
    stageVideo.currentTime = 0;
    void stageVideo.play().catch(() => undefined);
  };

  const handleRhythmPulse = () => {
    const stageAudio = garageAudioRef.current;
    const audioRunning = isAudioActuallyPlaying(stageAudio);

    if (audioRunning) {
      if (fansTapGain > 0) {
        setShowCrowd((current) => Math.min(lotacaoTarget, current + fansTapGain));
      }
      if (hypeTapGain > 0) {
        applyShowRewards(0, hypeTapGain, 0);
        applyFameGain(hypeTapGain);
      }
    }

    if (!audioRunning) {
      setBeatHitFeedback(false);
      rhythmStreakRef.current = 0;
      if (rhythmBonusRef.current !== 1) {
        rhythmBonusRef.current = 1;
        setRhythmBonus(1);
      }
      setRhythmMeter((current) => Math.min(100, current + PRE_MUSIC_TAP_GAIN));
      return;
    }

    const now = Date.now();
    const delta = lastPulseAtRef.current ? now - lastPulseAtRef.current : 0;
    lastPulseAtRef.current = now;

    const elapsed = stageAudio ? getHowlCurrentTime(stageAudio) * 1000 : now - metronomeStartAtRef.current;
    const beatRemainder = elapsed % metronomeBeatMs;
    const beatDistance = Math.min(beatRemainder, metronomeBeatMs - beatRemainder);
    const onBeat = beatDistance <= metronomeHitWindowMs;

    if (onBeat) {
      setBeatHitFeedback(true);
      if (beatHitTimeoutRef.current) {
        window.clearTimeout(beatHitTimeoutRef.current);
      }
      beatHitTimeoutRef.current = window.setTimeout(() => {
        setBeatHitFeedback(false);
      }, 220);
    }

    if (delta > 0) {
      if (onBeat) {
        rhythmStreakRef.current += 1;
      } else if (beatDistance <= metronomeHitWindowMs * 2) {
        rhythmStreakRef.current = Math.max(0, rhythmStreakRef.current - 1);
      } else {
        rhythmStreakRef.current = 0;
      }
    }

    const nextBonus =
      rhythmStreakRef.current >= 10 ? 1.9 : rhythmStreakRef.current >= 7 ? 1.6 : rhythmStreakRef.current >= 4 ? 1.3 : 1;

    if (nextBonus !== rhythmBonusRef.current) {
      rhythmBonusRef.current = nextBonus;
      setRhythmBonus(nextBonus);
      if (nextBonus > 1) {
        setBonusFlash(true);
        if (bonusFlashTimeoutRef.current) {
          window.clearTimeout(bonusFlashTimeoutRef.current);
        }
        bonusFlashTimeoutRef.current = window.setTimeout(() => {
          setBonusFlash(false);
        }, 240);
      }
    }

    const gainBase = onBeat ? 8 : beatDistance <= metronomeHitWindowMs * 2 ? 5 : 3;
    const gain = Math.ceil(gainBase * rhythmBonusRef.current);
    setRhythmMeter((current) => Math.min(100, current + gain));
  };

  useEffect(() => {
    fameProgressRef.current = 0;
    setFameProgressValue(0);
  }, [currentStageId, activeBandId]);

  useEffect(() => {
    mapAmbienceHowlRef.current = new Howl({
      src: [ambienceMapAudio],
      preload: true,
      html5: false,
      loop: true,
      volume: 0,
    });

    stageAmbienceHowlRef.current = new Howl({
      src: [ambienceStageCrowdAudio],
      preload: true,
      html5: false,
      loop: true,
      volume: 0,
    });

    return () => {
      clearAmbienceFadeTimeout(mapAmbienceFadeTimeoutRef);
      clearAmbienceFadeTimeout(stageAmbienceFadeTimeoutRef);

      mapAmbienceHowlRef.current?.stop();
      mapAmbienceHowlRef.current?.unload();
      mapAmbienceHowlRef.current = null;

      stageAmbienceHowlRef.current?.stop();
      stageAmbienceHowlRef.current?.unload();
      stageAmbienceHowlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const isAmbienceEnabled = isMusicEnabled && isSfxEnabled;
    const isMapMenuModalOpen = isMusiciansScreenVisible || isBandManagementScreenVisible || isBandConfigVisible;

    if (isStageShowActive) {
      stopAmbienceWithFade(mapAmbienceHowlRef.current, mapAmbienceFadeTimeoutRef);
      if (isAmbienceEnabled) {
        playAmbienceWithFade(stageAmbienceHowlRef.current, STAGE_AMBIENCE_VOLUME, stageAmbienceFadeTimeoutRef);
      } else {
        stopAmbienceWithFade(stageAmbienceHowlRef.current, stageAmbienceFadeTimeoutRef);
      }
      return;
    }

    stopAmbienceWithFade(stageAmbienceHowlRef.current, stageAmbienceFadeTimeoutRef);
    if (isAmbienceEnabled && !isMapMenuModalOpen) {
      playAmbienceWithFade(mapAmbienceHowlRef.current, MAP_AMBIENCE_VOLUME, mapAmbienceFadeTimeoutRef);
    } else {
      stopAmbienceWithFade(mapAmbienceHowlRef.current, mapAmbienceFadeTimeoutRef);
    }
  }, [isStageShowActive, isMusicEnabled, isSfxEnabled, isMusiciansScreenVisible, isBandManagementScreenVisible, isBandConfigVisible]);

  useEffect(() => {
    pauseStageAudios();
    getStageAudios().forEach((audio) => {
      audio.seek(0);
    });

    stagePlayPendingRef.current = false;
    stagePlaybackSecRef.current = 0;
    soldOutHandledRef.current = false;
    crowdDecayStepRef.current = 0;

    rhythmStreakRef.current = 0;
    rhythmBonusRef.current = 1;
    lastPulseAtRef.current = 0;

    setSongCurrentSec(0);
    setRhythmMeter(0);
    setRhythmBonus(1);
    setIsMusicPlaying(false);
    setMetronomeTick(false);
    metronomeBeatIndexRef.current = -1;
  }, [currentStageId]);

  useEffect(() => {
    moneyRewardHowlRef.current = new Howl({
      src: [sfxMoneyReward],
      preload: true,
      html5: false,
      volume: 1,
    });

    applauseHowlRef.current = new Howl({
      src: [sfxCrowdApplause],
      preload: true,
      html5: false,
      volume: 1,
    });

    purchaseHowlRef.current = new Howl({
      src: [sfxPurchased],
      preload: true,
      html5: false,
      volume: 1,
    });

    starRewardHowlRef.current = new Howl({
      src: [sfxStarReward],
      preload: true,
      html5: false,
      volume: 1,
    });

    return () => {
      moneyRewardHowlRef.current?.stop();
      moneyRewardHowlRef.current?.unload();
      moneyRewardHowlRef.current = null;

      applauseHowlRef.current?.stop();
      applauseHowlRef.current?.unload();
      applauseHowlRef.current = null;

      purchaseHowlRef.current?.stop();
      purchaseHowlRef.current?.unload();
      purchaseHowlRef.current = null;

      starRewardHowlRef.current?.stop();
      starRewardHowlRef.current?.unload();
      starRewardHowlRef.current = null;
    };
  }, []);

  const playSoldOutRewardSounds = () => {
    if (!isSfxEnabled) {
      return;
    }

    const moneySfx = moneyRewardHowlRef.current;
    const applauseSfx = applauseHowlRef.current;

    if (moneySfx) {
      moneySfx.stop();
      moneySfx.play();
    }

    if (applauseSfx) {
      applauseSfx.stop();
      applauseSfx.play();
    }
  };

  const playPurchaseSound = () => {
    if (!isSfxEnabled) {
      return;
    }

    const purchaseSfx = purchaseHowlRef.current;
    if (!purchaseSfx) {
      return;
    }

    purchaseSfx.stop();
    purchaseSfx.play();
  };

  const playFameStarSound = () => {
    if (!isSfxEnabled) {
      return;
    }

    const starRewardSfx = starRewardHowlRef.current;
    if (!starRewardSfx) {
      return;
    }

    starRewardSfx.stop();
    starRewardSfx.play();
  };

  useEffect(() => {
    if (!isMusicPlayingRef.current) {
      return;
    }

    if (showCrowd < lotacaoTarget) {
      soldOutHandledRef.current = false;
      return;
    }

    if (soldOutHandledRef.current) {
      return;
    }

    soldOutHandledRef.current = true;
  playSoldOutRewardSounds();
    triggerSoldOutRewardAnimation();
    applyShowRewards(fansRewardOnSoldOut, SHOW_FAME_REWARD, gainValue);
    applyFameGain(SHOW_FAME_REWARD);
    setSessionNetGain((current) => current + gainValue);
    setShowCrowd(0);
  }, [showCrowd, lotacaoTarget, fansRewardOnSoldOut, applyShowRewards, gainValue, applyFameGain]);

  useEffect(() => {
    if (!isMusicPlaying) {
      setMusicStreakMs(0);
      setFansGainRate(0);
      fansStepIndexRef.current = 0;
      if (fansStepFlashTimeoutRef.current) {
        window.clearTimeout(fansStepFlashTimeoutRef.current);
      }
      setFansStepFlash(false);
      return;
    }

    setFansGainRate(FANS_GAIN_BASE_RATE);
    fansStepIndexRef.current = 0;
    const intervalId = window.setInterval(() => {
      setMusicStreakMs((current) => {
        const next = current + 200;
        const rawStepCount = Math.floor(next / FANS_GAIN_STEP_MS);
        const maxStepCount = Math.floor((FANS_GAIN_MAX_RATE - FANS_GAIN_BASE_RATE) / FANS_GAIN_STEP_RATE);
        const stepCount = Math.min(maxStepCount, rawStepCount);
        const nextRate = Math.min(FANS_GAIN_MAX_RATE, FANS_GAIN_BASE_RATE + stepCount * FANS_GAIN_STEP_RATE);

        if (stepCount > fansStepIndexRef.current) {
          fansStepIndexRef.current = stepCount;
          setFansStepFlash(true);
          if (fansStepFlashTimeoutRef.current) {
            window.clearTimeout(fansStepFlashTimeoutRef.current);
          }
          fansStepFlashTimeoutRef.current = window.setTimeout(() => {
            setFansStepFlash(false);
          }, 850);
        }

        setFansGainRate(nextRate);
        return next;
      });
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isMusicPlaying]);

  useLayoutEffect(() => {
    const stageElement = stageRef.current;
    const centerPanelElement = centerPanelRef.current;
    const currentSongElement = currentSongBarRef.current;
    const fansTrackElement = fansGainTrackRef.current;

    if (!stageElement || !centerPanelElement || (!currentSongElement && !fansTrackElement)) {
      return;
    }

    const updateSideMetersPosition = () => {
      const nextCenterPanelElement = centerPanelRef.current;
      const nextFansTrackElement = fansGainTrackRef.current;
      const nextCurrentSongElement = currentSongBarRef.current;
      const anchorElement = nextFansTrackElement ?? nextCurrentSongElement;

      if (!anchorElement || !nextCenterPanelElement) {
        return;
      }

      const centerPanelBounds = nextCenterPanelElement.getBoundingClientRect();
      const anchorBounds = anchorElement.getBoundingClientRect();

      const desiredBottom = Math.round(centerPanelBounds.bottom - anchorBounds.top + 10);
      const clampedBottom = Math.max(-180, Math.min(120, desiredBottom));
      stageElement.style.setProperty('--stage-side-meter-bottom', `${clampedBottom}px`);
    };

    updateSideMetersPosition();

    const resizeObserver = new ResizeObserver(() => {
      updateSideMetersPosition();
    });

    resizeObserver.observe(stageElement);
    resizeObserver.observe(centerPanelElement);
    if (currentSongElement) {
      resizeObserver.observe(currentSongElement);
    }
    if (fansTrackElement) {
      resizeObserver.observe(fansTrackElement);
    }
    window.addEventListener('resize', updateSideMetersPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSideMetersPosition);
      stageElement.style.removeProperty('--stage-side-meter-bottom');
    };
  }, []);

  useEffect(() => {
    return () => {
      if (fansStepFlashTimeoutRef.current) {
        window.clearTimeout(fansStepFlashTimeoutRef.current);
      }
      if (loopTransitionTimeoutRef.current) {
        window.clearTimeout(loopTransitionTimeoutRef.current);
      }
      if (mapReturnTransitionTimeoutRef.current) {
        window.clearTimeout(mapReturnTransitionTimeoutRef.current);
      }
    };
  }, []);

  const spawnTapEffect = (clientX: number, clientY: number) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    const id = tapEffectIdRef.current + 1;
    tapEffectIdRef.current = id;

    setTapEffects((current) => [
      ...current.slice(-(MAX_TAP_EFFECTS - 1)),
      {
        id,
        x: clientX - bounds.left,
        y: clientY - bounds.top,
      },
    ]);

    window.setTimeout(() => {
      setTapEffects((current) => current.filter((effect) => effect.id !== id));
    }, TAP_EFFECT_LIFETIME_MS);
  };

  const handlePointerPulse = (event: React.PointerEvent<HTMLElement>) => {
    if (activeScreen !== 'band' || isBandManagementScreenVisible || isBandConfigVisible || !isStageShowActive) {
      return;
    }

    event.preventDefault();
    handleRhythmPulse();
    spawnTapEffect(event.clientX, event.clientY);
  };

  useEffect(() => {
    setSongDurationSec(0);
    setSongCurrentSec(0);
    const stemEntries = activeBandInstruments
      .map((instrument) => ({ instrument, src: selectedMusicStems[instrument] }))
      .filter((entry): entry is { instrument: Instrument; src: string } => Boolean(entry.src));

    const stageStemAudios: Partial<Record<Instrument, Howl>> = {};
    stemEntries.forEach(({ instrument, src }) => {
      stageStemAudios[instrument] = new Howl({
        src: [src],
        preload: true,
        html5: false,
        pool: 1,
        volume: isMusicEnabled ? (instrumentVolumes[instrument] ?? 1) : 0,
      });
    });

    stageStemAudiosRef.current = stageStemAudios;

    const stageAudio = instrumentPlaybackOrder
      .map((instrument) => stageStemAudios[instrument])
      .find((audio): audio is Howl => Boolean(audio)) ?? null;

    garageAudioRef.current = stageAudio;

    if (stageAudio) {
      stagePlaybackSecRef.current = Math.max(0, Math.min(stagePlaybackSecRef.current, stageAudio.duration() || stagePlaybackSecRef.current));
    }

    const handleLoadedMetadata = () => {
      if (stageAudio) {
        const duration = stageAudio.duration();
        if (Number.isFinite(duration) && duration > 0) {
          setSongDurationSec(duration);
        }
      }
    };

    const handleAudioSeek = () => {
      if (stageAudio) {
        const currentTime = getHowlCurrentTime(stageAudio);
        stagePlaybackSecRef.current = currentTime;
        setSongCurrentSec(currentTime);
        if (stageAudio.playing() && currentTime > 0 && !isMusicPlayingRef.current) {
          setIsMusicPlaying(true);
        }
      }
    };

    const handleAudioPlay = () => {
      stagePlayPendingRef.current = false;
      metronomeStartAtRef.current = Date.now();
      metronomeBeatIndexRef.current = -1;
      setIsMusicPlaying(true);
    };

    const handleAudioPause = () => {
      stagePlayPendingRef.current = false;
      setIsMusicPlaying(false);
      setMetronomeTick(false);
      metronomeBeatIndexRef.current = -1;
    };

    const handleAudioEnded = () => {
      setSongCurrentSec(stageAudio ? stageAudio.duration() : 0);
      stagePlaybackSecRef.current = 0;
      handleAudioPause();
    };

    const handlePlayError = () => {
      stagePlayPendingRef.current = false;
      setIsMusicPlaying(false);
      setMetronomeTick(false);
      metronomeBeatIndexRef.current = -1;
      stageAudio.once('unlock', () => {
        attemptStageAudioPlay();
      });
      window.setTimeout(() => {
        attemptStageAudioPlay();
      }, 140);
    };

    stageAudio?.on('load', handleLoadedMetadata);
    stageAudio?.on('play', handleAudioPlay);
    stageAudio?.on('pause', handleAudioPause);
    stageAudio?.on('end', handleAudioEnded);
    stageAudio?.on('seek', handleAudioSeek);
    stageAudio?.on('playerror', handlePlayError);

    if (stageAudio?.state() === 'loaded') {
      handleLoadedMetadata();
    }

    const decay = window.setInterval(() => {
      if (stageAudio) {
        const currentTime = getHowlCurrentTime(stageAudio);
        stagePlaybackSecRef.current = currentTime;
        setSongCurrentSec(currentTime);
        if (stageAudio.playing() && currentTime > 0 && !isMusicPlayingRef.current) {
          setIsMusicPlaying(true);
        }
      }

      setRhythmMeter((current) => Math.max(0, current - (isMusicPlayingRef.current ? POST_MUSIC_DECAY : PRE_MUSIC_DECAY)));
      if (!isMusicPlayingRef.current) {
        crowdDecayStepRef.current += 1;
        if (crowdDecayStepRef.current >= CROWD_DECAY_EVERY_STEPS) {
          crowdDecayStepRef.current = 0;
          setShowCrowd((current) => Math.max(0, current - crowdDecayAmountRef.current));
        }
      } else {
        crowdDecayStepRef.current = 0;
      }

      const now = Date.now();
      if (lastPulseAtRef.current && now - lastPulseAtRef.current > 900 && rhythmBonusRef.current > 1) {
        rhythmStreakRef.current = 0;
        rhythmBonusRef.current = 1;
        setRhythmBonus(1);
      }
    }, 100);

    return () => {
      window.clearInterval(decay);
      if (bonusFlashTimeoutRef.current) {
        window.clearTimeout(bonusFlashTimeoutRef.current);
      }
      if (metronomeFlashTimeoutRef.current) {
        window.clearTimeout(metronomeFlashTimeoutRef.current);
      }
      if (beatHitTimeoutRef.current) {
        window.clearTimeout(beatHitTimeoutRef.current);
      }
      stagePlayPendingRef.current = false;
      stageAudio?.off('load', handleLoadedMetadata);
      stageAudio?.off('play', handleAudioPlay);
      stageAudio?.off('pause', handleAudioPause);
      stageAudio?.off('end', handleAudioEnded);
      stageAudio?.off('seek', handleAudioSeek);
      stageAudio?.off('playerror', handlePlayError);
      instrumentPlaybackOrder.forEach((instrument) => {
        clearStageStemFadeTimeout(instrument);
      });
      pauseStageAudios();
      getStageAudios().forEach((audio) => {
        audio.stop();
        audio.unload();
      });
      stageStemAudiosRef.current = {};
      garageAudioRef.current = null;
    };
  }, [selectedMusicStems, activeBandInstrumentsKey]);

  useEffect(() => {
    instrumentPlaybackOrder.forEach((instrument) => {
      const audio = stageStemAudiosRef.current[instrument];
      if (!audio) {
        return;
      }

      audio.volume(isMusicEnabled ? (instrumentVolumes[instrument] ?? 1) : 0);
    });
  }, [isMusicEnabled, instrumentVolumes]);

  useEffect(() => {
    if (!isMusicPlaying) {
      setMetronomeTick(false);
      metronomeBeatIndexRef.current = -1;
      if (metronomeAnimationFrameRef.current) {
        window.cancelAnimationFrame(metronomeAnimationFrameRef.current);
        metronomeAnimationFrameRef.current = null;
      }
      return;
    }

    const syncMetronomeWithAudio = () => {
      const stageAudio = garageAudioRef.current;
      if (!isAudioActuallyPlaying(stageAudio)) {
        setMetronomeTick(false);
        setIsMusicPlaying(false);
        metronomeBeatIndexRef.current = -1;
        return;
      }
      const elapsedMs = stageAudio ? Math.max(0, getHowlCurrentTime(stageAudio) * 1000) : 0;
      const beatIndex = Math.floor(elapsedMs / metronomeBeatMs);

      if (beatIndex !== metronomeBeatIndexRef.current) {
        metronomeBeatIndexRef.current = beatIndex;
        setMetronomeTick(true);
        if (metronomeFlashTimeoutRef.current) {
          window.clearTimeout(metronomeFlashTimeoutRef.current);
        }
        metronomeFlashTimeoutRef.current = window.setTimeout(() => {
          setMetronomeTick(false);
        }, 120);
      }

      metronomeAnimationFrameRef.current = window.requestAnimationFrame(syncMetronomeWithAudio);
    };

    metronomeAnimationFrameRef.current = window.requestAnimationFrame(syncMetronomeWithAudio);

    return () => {
      if (metronomeAnimationFrameRef.current) {
        window.cancelAnimationFrame(metronomeAnimationFrameRef.current);
        metronomeAnimationFrameRef.current = null;
      }
    };
  }, [isMusicPlaying, metronomeBeatMs]);

  useEffect(() => {
    isMusicPlayingRef.current = isMusicPlaying;
  }, [isMusicPlaying]);

  useEffect(() => {
    rhythmMeterRef.current = rhythmMeter;
  }, [rhythmMeter]);

  useEffect(() => {
    hasActiveMusiciansRef.current = hasActiveMusicians;
  }, [hasActiveMusicians]);

  useEffect(() => {
    crowdDecayAmountRef.current = Math.max(0, Math.floor(bandFansValue));
  }, [bandFansValue]);

  useEffect(() => {
    isMusicEnabledRef.current = isMusicEnabled;
  }, [isMusicEnabled]);

  useEffect(() => {
    const stageAudio = garageAudioRef.current;
    if (!stageAudio) {
      return;
    }

    if (!hasActiveMusicians) {
      pauseStageAudios();
      setIsMusicPlaying(false);
      setMetronomeTick(false);
      metronomeBeatIndexRef.current = -1;
      return;
    }

    if (rhythmMeter > RHYTHM_PLAY_THRESHOLD) {
      attemptStageAudioPlay();
      return;
    }

    pauseStageAudios();
    setIsMusicPlaying(false);
    setMetronomeTick(false);
    metronomeBeatIndexRef.current = -1;
  }, [rhythmMeter, hasActiveMusicians]);

  useEffect(() => {
    const tryResumeStageMusic = () => {
      const stageAudio = garageAudioRef.current;
      if (!stageAudio || !isMusicEnabled || !hasActiveMusicians) {
        return;
      }

      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      attemptStageAudioPlay();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tryResumeStageMusic();
      }
    };

    const handlePageShow = () => {
      tryResumeStageMusic();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [rhythmMeter, hasActiveMusicians, isMusicEnabled]);

  useEffect(() => {
    const unlockAudio = () => {
      Howler.autoSuspend = false;
      void Howler.ctx?.resume();
      attemptStageAudioPlay();
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  return (
    <section
      className="game-screen stage-screen"
      ref={stageRef}
      style={{ backgroundImage: `url(${stageBackground})` }}
      onPointerDownCapture={handlePointerPulse}
    >
      <div className={`stage-loop-fade${isLoopTransitioning ? ' show' : ''}`} aria-hidden="true" />
      <div className="stage-overlay" />
      {isStageShowActive ? (
        <>
          <Stage3DScene
            key={`stage3d-${currentStageId}`}
            textureUrl={defaultStageFloorTexture}
            backgroundImageUrl={stage3DBackground}
            backgroundVideoUrl={stageAnimatedBackground}
            isMusicPlaying={isMusicPlaying}
            activeMusicians={stage3DActiveMusicians}
            activeMusiciansSignature={stage3DActiveMusiciansSignature}
          />
          <StageVisualEffectsLayer
            tapEffects={tapEffects}
            rewardParticles={rewardParticles}
            rewardTexts={rewardTexts}
            iconFansWhite={iconFansWhite}
            iconMoneyWhite={iconMoneyWhite}
            iconFameWhite={iconFameWhite}
            formatNumber={formatNumber}
          />
        </>
      ) : null}

      <button type="button" className="back-link" onClick={onBackToMenu} data-click-sfx="close">
        Bandas
      </button>

      <MusiciansContractScreen
        isVisible={isMusiciansScreenVisible}
        isClosing={isClosingMusiciansScreen}
        backgroundAudicao={backgroundAudicao}
        portraitContratante={portraitContratante}
        iconFechar={iconFechar}
        iconBloqueado={iconBloqueado}
        iconDisponivel={iconDisponivel}
        selectedInstrumentIcon={selectedMusicianInstrumentIcon}
        iconMoneyWhite={iconMoneyWhite}
        iconFameWhite={iconFameWhite}
        iconFansWhite={iconFansWhite}
        iconRhythmWhite={iconRhythmWhite}
        iconCost={iconCost}
        selectedMusicianDetails={selectedMusicianDetails}
        selectedMusicianFace={selectedMusicianFace}
        selectedMusicianPortrait={selectedMusicianPortrait}
        selectedMusicianInitials={selectedMusicianInitials}
        selectedMusicianRarityClass={selectedMusicianRarityClass}
        isClosingMusicianDetails={isClosingMusicianDetails}
        isMusicianStoryOpen={isMusicianStoryOpen}
        isSelectedMusicianHired={isSelectedMusicianHired}
        isSelectedMusicianLockedByCoins={isSelectedMusicianLockedByCoins}
        canHireSelectedMusician={canHireSelectedMusician}
        selectedMusicianPrice={selectedMusicianPrice}
        hireFilter={hireFilter}
        filterOptions={filterOptions}
        listedMusicianItems={listedMusicianItems}
        formatNumber={formatNumber}
        formatPerformancePercent={formatPerformancePercent}
        instrumentNameById={instrumentNameById}
        onCloseScreen={closeMusiciansScreen}
        onCloseDetails={closeMusicianDetails}
        onToggleStory={toggleMusicianStory}
        onChangeFilter={setHireFilter}
        onOpenMusicianDetails={openMusicianDetails}
        onHireSelected={() => {
          if (!selectedInstrument || !canHireSelectedMusician || !selectedMusicianDetails || availableBandCoins < selectedMusicianPrice) {
            return;
          }

          hireMusician(selectedInstrument, selectedMusicianPrice, selectedMusicianDetails.ID);
          playPurchaseSound();
        }}
      />

      <BandManagementScreen
        isVisible={isBandManagementScreenVisible}
        isClosing={isClosingBandManagement}
        backgroundBackstage={backgroundBackstage}
        iconFechar={iconFechar}
        iconBloqueado={iconBloqueado}
        iconDisponivel={iconDisponivel}
        iconMoneyWhite={iconMoneyWhite}
        iconFameWhite={iconFameWhite}
        iconFansWhite={iconFansWhite}
        iconRhythmWhite={iconRhythmWhite}
        iconCost={iconCost}
        bandHypeValue={bandHypeValue}
        bandFansValue={bandFansValue}
        bandPerformanceValue={bandPerformanceValue}
        bandCostValue={bandCostValue}
        formatNumber={formatNumber}
        formatPerformancePercent={formatPerformancePercent}
        formatCurrency={formatCurrency}
        bandMenuView={bandMenuView}
        bandMenuOptions={bandMenuOptions}
        onChangeBandMenuView={setBandMenuView}
        activeBandSelectorInstrument={activeBandSelectorInstrument}
        bandInstrumentColumns={bandInstrumentColumns}
        selectorMusicians={selectorMusicians}
        selectedSelectorMusicianId={selectedSelectorMusicianId}
        instrumentLabels={instrumentLabels}
        iconMusicoVazio={iconMusicoVazio}
        onOpenInstrument={setActiveBandSelectorInstrument}
        onCloseSelector={() => setActiveBandSelectorInstrument(null)}
        onSelectEmpty={(instrument) => {
          setBandMusicianSelection(instrument, null);
          setActiveBandSelectorInstrument(null);
        }}
        onSelectMusician={(instrument, musicianId) => {
          setBandMusicianSelection(instrument, musicianId);
          setActiveBandSelectorInstrument(null);
        }}
        onCloseScreen={closeBandManagementScreen}
      />

      <StageTopValuesBar
        bandLogoUrl={activeBand.logoUrl}
        availableBandCoins={availableBandCoins}
        fans={activeBand.fans}
        fameStars={Math.max(0, Math.floor(activeBand.fameStars ?? 0))}
        iconMoneyBlack={iconMoneyBlack}
        iconFansBlack={iconFansBlack}
        iconFameBlack={iconFameBlack}
        onOpenBandConfig={openBandConfig}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        famePulseTick={famePulseTick}
        topMoneyRef={topMoneyRef}
        topFansRef={topFansRef}
        topFameRef={topFameRef}
      />

      <BandConfigModal
        isVisible={isBandConfigVisible}
        isClosing={isClosingBandConfig}
        bandName={activeBand.name}
        bandLogoUrl={activeBand.logoUrl}
        isSfxEnabled={isSfxEnabled}
        isMusicEnabled={isMusicEnabled}
        iconConfig={iconConfig}
        iconFechar={iconFechar}
        iconAudioOn={iconAudioOn}
        iconExitBand={iconExitBand}
        instrumentVolumeControls={instrumentVolumeControls}
        onClose={closeBandConfig}
        onToggleSfx={setSfxEnabled}
        onToggleMusic={setMusicEnabled}
        onChangeInstrumentVolume={setInstrumentVolume}
        onExitBand={() => {
          closeBandConfig();
          onBackToMenu();
        }}
      />

      {isStageShowActive ? (
        <div className="stage-progress-stack">
          <StageProgressList
            iconFameWhite={iconFameWhite}
            iconFansWhite={iconFansWhite}
            famePct={famePct}
            fameValue={fameValue}
            fameTarget={fameTarget}
            lotacaoPct={lotacaoPct}
            lotacaoValue={lotacaoValue}
            lotacaoTarget={lotacaoTarget}
            formatNumber={formatNumber}
            fameTrackRef={fameTrackRef}
            crowdTrackRef={crowdTrackRef}
          />

          <StageCurrentSongBar
            iconFansWhite={iconFansWhite}
            iconMusicWhite={iconMusicWhite}
            fansGainBarPct={fansGainBarPct}
            fansGainRate={fansGainRate}
            fansStepFlash={fansStepFlash}
            songProgressPct={songProgressPct}
            currentSongName={currentSongName}
            wrapperRef={currentSongBarRef}
            fansTrackRef={fansGainTrackRef}
          />
        </div>
      ) : null}

      {isStageShowActive ? (
        <StageCenterPanel
          iconFameWhite={iconFameWhite}
          iconFansWhite={iconFansWhite}
          iconRhythmWhite={iconRhythmWhite}
          iconCost={iconCost}
          iconIngresso={iconIngresso}
          iconValorCacheTotal={iconValorCacheTotal}
          iconCache={iconCache}
          bandHypeValue={bandHypeValue}
          bandFansValue={bandFansValue}
          bandPerformanceValue={bandPerformanceValue}
          selectedStageName={selectedStage?.Palco ?? 'Garagem de Casa'}
          onExitShow={handleExitStageShow}
          venueBadgeIcon={selectedStageBadge}
          stageTicketPrice={stageTicketPrice}
          lotacaoTotalValue={lotacaoTotalValue}
          costSharePct={costSharePct}
          gainSharePct={gainSharePct}
          gainValue={gainValue}
          metronomeTick={metronomeTick}
          beatHitFeedback={beatHitFeedback}
          isMusicPlaying={isMusicPlaying}
          metronomeBeatMs={metronomeBeatMs}
          rhythmBonus={rhythmBonus}
          bonusFlash={bonusFlash}
          rhythmMeter={rhythmMeter}
          musicStartThreshold={RHYTHM_PLAY_THRESHOLD}
          rhythmTone={getRhythmTone(rhythmMeter)}
          bandCostValue={bandCostValue}
          formatNumber={formatNumber}
          formatPerformancePercent={formatPerformancePercent}
          formatCurrency={formatCurrency}
          gainMeterRef={gainMeterRef}
          wrapperRef={centerPanelRef}
        />
      ) : null}

      <StageMapModal
        isVisible={!isStageShowActive}
        mapImageUrl={stageWorldMap}
        stages={stageMapEntries}
        currentStageId={currentStageId}
        isEmbedded
        onStageTransitionStart={() => {
          setIsSideMenuHiding(true);
        }}
        onClose={() => undefined}
        onSelectStage={(stageId) => {
          setCurrentStage(stageId);
          setIsStageShowActive(true);
          setIsSideMenuHiding(false);
        }}
      />

      {!isStageShowActive && activeScreen !== 'musicians' && !isBandManagementScreenVisible ? (
      <StageBottomNav
        variant="side"
        isHiding={isSideMenuHiding}
        isBandManagementScreenVisible={isBandManagementScreenVisible}
        availableToHireCount={availableToHireCount}
        navBand={navBand}
        navHire={navHire}
        navStore={navStore}
        navStage={navStage}
        navSongs={navSongs}
        onOpenBandManagementScreen={openBandManagementScreen}
        onOpenMusiciansScreen={openMusiciansScreen}
        onCycleStage={() => undefined}
      />
      ) : null}

      <div
        className={`stage-map-return-overlay${mapReturnTransitionPhase !== 'idle' ? ' active' : ''}${mapReturnTransitionPhase === 'to-black' ? ' to-black' : ''}${mapReturnTransitionPhase === 'from-black' ? ' from-black' : ''}`}
        aria-hidden="true"
      />
    </section>
  );
};

export default BandGame;
